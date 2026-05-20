import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PhoneNumberInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "@/lib/phone";
import { useToast } from "@/components/ui/toast";
import { updateStudentPhone } from "@/api";
import { useAuthStore } from "@/store/authStore";

export function PhoneNumberPrompt() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const needsPhone =
    user?.role === "student" && !(user.phone && user.phone.trim());

  useEffect(() => {
    if (needsPhone) {
      setPhone("");
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [needsPhone]);

  const handleSave = async () => {
    const cleanedPhone = phone.trim();

    if (!isValidPhoneNumber(cleanedPhone)) {
      toast("Please enter a valid phone number", "error");
      return;
    }

    try {
      setSaving(true);
      const response = await updateStudentPhone(cleanedPhone);
      if (user) {
        setUser({
          ...user,
          ...response?.data?.user,
          phone: response?.data?.user?.phone || cleanedPhone,
        });
      }
      toast("Phone number added successfully", "success");
      setIsOpen(false);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Failed to add phone number";
      toast(
        message,
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!needsPhone) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Add Your Phone Number"
    >
      <div className="space-y-5">
        <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0061FF] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Keep your enrollment reachable
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Admins use this for payment reminders, schedule updates, and
              WhatsApp support. You can update it later from your profile.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Phone Number
          </label>
          <PhoneNumberInput
            value={phone}
            onChange={setPhone}
            required
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1 bg-[#0061FF] text-white hover:bg-[#0052E6]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Phone Number"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
            disabled={saving}
          >
            Later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
