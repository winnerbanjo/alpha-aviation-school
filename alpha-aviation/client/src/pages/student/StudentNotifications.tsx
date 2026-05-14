import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock, CreditCard, XCircle } from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const getNotificationIcon = (type: NotificationItem["type"]) => {
  if (type === "payment_approved") return CheckCircle2;
  if (type === "payment_rejected") return XCircle;
  return CreditCard;
};

const getNotificationStyles = (type: NotificationItem["type"]) => {
  if (type === "payment_approved") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  if (type === "payment_rejected") {
    return "bg-rose-50 text-rose-700 border-rose-100";
  }
  return "bg-blue-50 text-blue-700 border-blue-100";
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function StudentNotifications() {
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
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Notifications
          </h1>
          <p className="text-slate-500">
            Review payment receipt decisions and account updates.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="self-start sm:self-auto"
        >
          Mark all as read
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-slate-900">Inbox</CardTitle>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-700 border-none"
            >
              {unreadCount} unread
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-7 h-7 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-900">
                No notifications yet
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Payment review updates will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const isUnread = !notification.readAt;

                return (
                  <div
                    key={notification._id}
                    className={`p-5 flex gap-4 ${
                      isUnread ? "bg-blue-50/40" : "bg-white"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${getNotificationStyles(notification.type)}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900">
                              {notification.title}
                            </p>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1 leading-6">
                            {notification.message}
                          </p>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(notification.createdAt)}
                        </div>
                      </div>
                      {isUnread && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 px-0 text-blue-700 hover:text-blue-800 hover:bg-transparent"
                          onClick={() => handleMarkRead(notification._id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
