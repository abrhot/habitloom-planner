"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, X, CheckCheck, Calendar, CheckSquare, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AppNotification, NotificationType } from "@/lib/notifications"
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
  deleteNotification,
  scheduleNotifications,
  requestPushPermission,
  triggerBrowserNotificationsForToday,
} from "@/lib/notifications"

interface NotificationBellProps {
  userId: string
}

const typeIcon: Record<NotificationType, React.ReactNode> = {
  event:     <Calendar className="w-3.5 h-3.5" />,
  todo:      <CheckSquare className="w-3.5 h-3.5" />,
  challenge: <Target className="w-3.5 h-3.5" />,
}

const typeColor: Record<NotificationType, string> = {
  event:     "text-sky-500 bg-sky-50 dark:bg-sky-900/20",
  todo:      "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
  challenge: "text-violet-500 bg-violet-50 dark:bg-violet-900/20",
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [pushGranted, setPushGranted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const [notifs, count] = await Promise.all([
      getNotifications(userId),
      getUnreadCount(userId),
    ])
    setNotifications(notifs)
    setUnread(count)
  }, [userId])

  useEffect(() => {
    // Schedule in-app notifications + browser push on mount
    scheduleNotifications(userId).then(() => load())
    triggerBrowserNotificationsForToday(userId)

    // Check push permission state
    if ("Notification" in window) {
      setPushGranted(Notification.permission === "granted")
    }

    // Refresh every 2 minutes
    const interval = setInterval(load, 120_000)
    return () => clearInterval(interval)
  }, [userId, load])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleOpen = async () => {
    setOpen((v) => !v)
    if (!open && unread > 0) {
      await markAllRead(userId)
      setUnread(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleMarkRead = async (id: string) => {
    await markRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleEnablePush = async () => {
    const granted = await requestPushPermission()
    setPushGranted(granted)
    if (granted) triggerBrowserNotificationsForToday(userId)
  }

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="nav-link relative w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-background" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 section-box shadow-elevated z-50 overflow-hidden animate-in-up">

          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {unread === 0 && notifications.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">All caught up</p>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Push permission prompt */}
          {!pushGranted && (
            <div className="px-4 py-3 bg-secondary/50 border-b border-border flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enable browser alerts for reminders
              </p>
              <button
                onClick={handleEnablePush}
                className="text-xs font-semibold text-foreground whitespace-nowrap hover:text-amber-500 transition-colors"
              >
                Enable
              </button>
            </div>
          )}

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={cn(
                    "px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-secondary/50 group",
                    !n.read && "bg-secondary/30"
                  )}
                >
                  {/* Type icon */}
                  <div className={cn(
                    "w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5",
                    typeColor[n.type]
                  )}>
                    {typeIcon[n.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={cn(
                        "text-xs font-semibold text-foreground leading-snug",
                        n.read && "font-medium text-muted-foreground"
                      )}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 stat-number">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(e, n.id)}
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-all flex-shrink-0 mt-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{notifications.length} total</span>
              <button
                onClick={async () => {
                  await markAllRead(userId)
                  setUnread(0)
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
