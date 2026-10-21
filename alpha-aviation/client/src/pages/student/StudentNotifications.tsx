import { useEffect, useState } from "react";
import { Award, Bell, CheckCircle2, Clock, CreditCard, XCircle, MailOpen } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/api";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationsPageProps {
  variant?: "student" | "admin";
}

const getNotificationIcon = (type: NotificationItem["type"]) => {
  if (type === "payment_approved" || type === "payment_confirmed") {
    return CheckCircle2;
  }
  if (type === "payment_submitted") return CreditCard;
  if (type === "payment_rejected") return XCircle;
  if (type === "certificate_issued") return Award;
  return CreditCard;
};

const getNotificationStyles = (type: NotificationItem["type"]) => {
  if (type === "payment_approved" || type === "payment_confirmed" || type === "certificate_issued") {
    return "bg-emerald-50 text-emerald-600 ring-emerald-600/15";
  }
  if (type === "payment_rejected") {
    return "bg-red-50 text-red-600 ring-red-600/15";
  }
  return "bg-[#DCE8FF] text-[#1246C8] ring-[#1246C8]/10";
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function StudentNotifications({
  variant = "student",
}: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    await markNotificationRead(notificationId);
    setNotifications((current) =>
      current.map((notification) =>
        notification._id === notificationId
          ? { ...notification, readAt: new Date().toISOString() }
          : notification,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, readAt })),
    );
    setUnreadCount(0);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow text-[#1246C8]">Updates</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
            Notifications
          </h1>
          <p className="mt-2 text-[#53647C]">
            {variant === "admin"
              ? "Review payment activity and admin alerts."
              : "Review payment receipt decisions and account updates."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="self-start sm:self-auto shrink-0 gap-1.5"
        >
          <MailOpen className="w-4 h-4" />
          <span>Mark all as read</span>
        </Button>
      </div>

      {/* Inbox Card Container */}
      <div className="overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle">
        <div className="flex items-center justify-between gap-4 border-b border-[#DCE2EB] px-6 py-5">
          <h3 className="text-base font-bold tracking-tight text-[#10264B]">Inbox</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE8FF] px-2.5 py-1 text-[11px] font-semibold text-[#1246C8] tabular-nums">
            {unreadCount} unread
          </span>
        </div>

        <div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-[#DCE2EB] border-t-[#1246C8]" />
              <p className="text-sm font-medium text-[#53647C]">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center max-w-sm mx-auto">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="mb-1 text-base font-bold tracking-tight text-[#10264B]">
                No Notifications Yet
              </h3>
              <p className="text-[13px] leading-relaxed text-[#53647C]">
                {variant === "admin"
                  ? "Payment activity alerts and verification request logs will appear here."
                  : "Tuition approvals, program unlocks, and clearance updates will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE2EB]/70">
              <AnimatePresence initial={false}>
                {notifications.map((notification, idx) => {
                  const Icon = getNotificationIcon(notification.type);
                  const isUnread = !notification.readAt;

                  return (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={`relative flex gap-4 px-6 py-5 transition-colors duration-300 ${
                        isUnread ? "bg-[#F2F6FF]" : "bg-white hover:bg-[#F5F7FB]"
                      }`}
                    >
                      {/* Left Icon circle */}
                      <div
                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ${getNotificationStyles(notification.type)}`}
                      >
                        <Icon className="w-[18px] h-[18px] relative z-10" />
                      </div>

                      {/* Content panel */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-[#10264B]">
                                {notification.title}
                              </p>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-[#1246C8]" />
                              )}
                            </div>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-[#53647C]">
                              {notification.message}
                            </p>
                          </div>

                          {/* Time label */}
                          <div className="mt-0.5 flex shrink-0 items-center gap-1.5 self-start text-xs font-medium text-[#8C9AB0] tabular-nums">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>

                        {/* Read action trigger */}
                        {isUnread && (
                          <button
                            type="button"
                            className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#10264B]/15 bg-white px-3 py-1 text-xs font-semibold text-[#10264B] transition-colors hover:border-[#1246C8] hover:text-[#1246C8]"
                            onClick={() => handleMarkRead(notification._id)}
                          >
                            <span>Mark as read</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
