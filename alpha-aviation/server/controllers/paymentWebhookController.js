const crypto = require("crypto");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { notifyPaymentConfirmed } = require("../utils/paymentNotifications");

exports.handlePaystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const { reference, customer, amount } = event.data;
      const email = customer.email;
      const user = await User.findOne({ email });

      if (user) {
        const existingPayment = await Payment.findOne({
          reference,
          status: "approved",
        });

        if (existingPayment) {
          return res.status(200).send("OK");
        }

        if (user.paymentStatus === "Paid") {
          return res.status(200).send("OK");
        }

        user.paymentStatus = "Paid";
        const paidAmount = amount / 100;
        user.amountPaid = (user.amountPaid || 0) + paidAmount;
        user.amountDue = Math.max(0, (user.amountDue || 0) - paidAmount);
        await user.save();

        const payment = await Payment.findOneAndUpdate(
          { reference: reference },
          {
            student: user._id,
            amount: paidAmount,
            status: "approved",
            receiptUrl: "Paystack Online Payment",
            reference: reference,
            adminNotes: "Verified via Paystack Webhook",
          },
          { upsert: true, new: true },
        );

        await notifyPaymentConfirmed({
          student: user,
          payment,
          source: "Paystack Webhook",
        });
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.status(500).send("Webhook Error");
  }
};
