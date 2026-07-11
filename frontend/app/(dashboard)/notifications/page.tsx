"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BellRing,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  ExternalLink,
  Inbox,
  RotateCcw,
  TicketCheck,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getNotifications, markAllNotificationRead, markNotificationAsRead } from "@/services/notification.service";
import Button from "@/components/common/Button";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { decrementUnreadCount, resetUnreadCount } from "@/store/slices/notificationSlice";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
  isRead?: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  const router = useRouter();

  async function fetchNotifications() {
    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response?.data?.data || []);
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      toast.error(message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // ---- Stats (total / read / unread) ----
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const read = total - unread;
    return { total, unread, read };
  }, [notifications]);

  // ---- Mark a single notification as read (backend call) ----
  const markRead = async (notification: Notification) => {
    if (notification.isRead || markingReadId === notification._id) {
      return;
    }

    try {
      setMarkingReadId(notification._id);
      await markNotificationAsRead(notification._id);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id ? { ...item, isRead: true } : item
        )
      );
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      toast.error(message || "Failed to mark notification as read");
    } finally {
      setMarkingReadId(null);
    }
  };

  const markAllRead = async () => {
    try {
      setMarkingReadId("all");

      await markAllNotificationRead();

      // Update all notifications locally
      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      // Reset unread count in Redux
      dispatch(resetUnreadCount());

      toast.success("All notifications marked as read");
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
          : undefined;

      toast.error(message || "Failed to mark all notifications as read");
    } finally {
      setMarkingReadId(null);
    }
  };

  const dispatch = useDispatch();

  // Open popup + mark as read immediately (this is what the backend call fires on)
  const handleOpen = async (notification: Notification) => {
    setSelectedNotification(notification);
    await markRead(notification);
    dispatch(decrementUnreadCount());
  };

  const handleClose = () => {
    setSelectedNotification(null);
  };

  const formatDate = (value: string) => {
    if (!value) return "";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 pb-10">

      <div style={{ textAlign: 'left', marginBottom: 20 }}>
        <Button
          title="Back"
          icon={<ArrowLeft size={13} />}
          type="success"
          outline
          onClick={() => router.back()}
        />
      </div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay on top of what needs your attention
          </p>
        </div>

        <div style={{width: 400, textAlign:'right', flex: 1, justifyContent: 'center', alignItems:'center', gap: 20}}>
          <button
            onClick={fetchNotifications}
            title="Refresh"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition mx-2"
          >
            <RotateCcw size={16}/>
          </button>

          <button
            onClick={markAllRead}
            title="Mark All read"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <CheckCheck size={16}/>
          </button>
        </div>
        
      </div>

      {/* ---- Stats cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <Inbox size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              {loading ? "-" : stats.total}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <BellRing size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Unread
            </p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              {loading ? "-" : stats.unread}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <span className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCheck size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Read
            </p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              {loading ? "-" : stats.read}
            </p>
          </div>
        </div>
      </div>

      {/* ---- Notification list ---- */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="min-h-[360px] flex flex-col items-center justify-center text-center px-6">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 size={26} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No notifications yet</h2>
            <p className="text-sm text-slate-500 mt-1">
              You are all caught up.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const isUnread = !notification.isRead;

              return (
                <button
                  key={notification._id}
                  onClick={() => handleOpen(notification)}
                  className={`w-full text-left p-5 transition flex items-start gap-4 ${isUnread ? "bg-emerald-50/30 hover:bg-emerald-50/60" : "hover:bg-slate-50"
                    }`}
                >
                  <span
                    className={`mt-1 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${isUnread
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-slate-50 border-slate-100 text-slate-400"
                      }`}
                  >
                    <Bell size={18} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <span
                          className={`text-sm ${isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-500"
                            }`}
                        >
                          {notification.title || "New notification"}
                        </span>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </span>

                      <span>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {formatDate(notification.createdAt)}
                        </span>
                      </span>
                    </span>

                    <span
                      className={`block text-sm mt-1 line-clamp-2 ${isUnread ? "text-slate-600" : "text-slate-400"
                        }`}
                    >
                      {notification.message}
                    </span>

                    {/* <span
                      className={`inline-flex mt-3 text-[11px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 border ${
                        isUnread
                          ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                          : "text-slate-500 bg-slate-50 border-slate-100"
                      }`}
                    >
                      {notification.type?.replaceAll("_", " ") || "GENERAL"}
                    </span> */}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- Popup / modal on open ---- */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-[9999] bg-black/45 flex items-center justify-center px-4 py-6"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  {selectedNotification.type?.replaceAll("_", " ") || "Notification"}
                </p>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedNotification.title || "New notification"}
                </h2>
              </div>

              <button
                onClick={handleClose}
                className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                aria-label="Close notification"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <p className="text-sm leading-6 text-slate-700">
                {selectedNotification.message}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarClock size={15} />
                {formatDate(selectedNotification.createdAt)}
              </div>

              {selectedNotification.actionUrl && (
                <a
                  href={selectedNotification.actionUrl}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 transition"
                >
                  Open related page
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}