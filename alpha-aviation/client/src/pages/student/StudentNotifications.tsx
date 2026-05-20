import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock, CreditCard, XCircle, MailOpen } from "lucide-react";
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
  return CreditCard;
};

const getNotificationStyles = (type: NotificationItem["type"]) => {
  if (type === "payment_approved" || type === "payment_confirmed") {
    return "bg-emerald-50 text-emerald-600 border-emerald-100/80";
  }
  if (type === "payment_rejected") {
    return "bg-rose-50 text-rose-600 border-rose-100/80";
  }
  return "bg-indigo-50 text-indigo-600 border-indigo-100/80";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            {variant === "admin"
              ? "Review payment activity and admin alerts."
              : "Review payment receipt decisions and account updates."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="self-start sm:self-auto rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-xs py-2 px-4 shadow-sm shrink-0 flex items-center gap-1.5 transition-all"
        >
          <MailOpen className="w-4 h-4" />
          <span>Mark all as read</span>
        </Button>
      </div>

      {/* Inbox Card Container */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <div className="px-5 py-4 border-b border-slate-100/80 bg-slate-50/50 flex items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900">Inbox</h3>
          <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/30">
            {unreadCount} unread
          </span>
        </div>

        <div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center max-w-sm mx-auto">
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 text-indigo-600 border border-indigo-100/80 shadow-sm overflow-hidden flex items-center justify-center mx-auto mb-4">
                <div className="absolute inset-0 bg-indigo-200/20 blur-sm rounded-full scale-75" />
                <Bell className="w-8 h-8 relative z-10 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No Notifications Yet
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {variant === "admin"
                  ? "Payment activity alerts and verification request logs will appear here."
                  : "Tuition approvals, program unlocks, and clearance updates will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
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
                      className={`p-5 flex gap-4 transition-all duration-300 ${
                        isUnread ? "bg-indigo-50/20" : "bg-white"
                      }`}
                    >
                      {/* Left Icon circle */}
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden ${getNotificationStyles(notification.type)}`}
                      >
                        <Icon className="w-5 h-5 relative z-10" />
                      </div>

                      {/* Content panel */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-slate-800">
                                {notification.title}
                              </p>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                          
                          {/* Time label */}
                          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 shrink-0 self-start mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                        </div>

                        {/* Read action trigger */}
                        {isUnread && (
                          <button
                            type="button"
                            className="mt-3 text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 hover:underline transition-all"
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
