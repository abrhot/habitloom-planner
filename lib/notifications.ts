import { createClient } from "./supabase/client"
import { getToday } from "./date-utils"

export type NotificationType = "event" | "todo" | "challenge"

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  refId?: string
  refDate?: string
  read: boolean
  createdAt: string
}

// ── Fetch ──────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<AppNotification[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) throw error
  return (data ?? []).map(mapNotification)
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) throw error
  return count ?? 0
}

export async function markAllRead(userId: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false)
}

export async function markRead(notificationId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("notifications").update({ read: true }).eq("id", notificationId)
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from("notifications").delete().eq("id", notificationId)
}

// ── Create ─────────────────────────────────────────────────────

async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  refId?: string,
  refDate?: string
): Promise<void> {
  const supabase = createClient()
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    ref_id: refId ?? null,
    ref_date: refDate ?? null,
  })
}

// ── Scheduler — run on app load ────────────────────────────────
// Checks events/todos/challenges and creates notifications if needed.
// Uses localStorage to avoid spamming the same notification daily.

export async function scheduleNotifications(userId: string): Promise<void> {
  const today = getToday()
  const storageKey = `habitloom_notif_scheduled_${userId}_${today}`

  // Only run once per day per user
  if (localStorage.getItem(storageKey)) return
  localStorage.setItem(storageKey, "1")

  try {
    const supabase = createClient()

    // ── Events: notify about events today and tomorrow ──
    const { data: events } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .gte("date", today)
      .lte("date", getDateOffset(1))

    for (const ev of events ?? []) {
      const isToday = ev.date === today
      const timeStr = ev.time ? ` at ${ev.time}` : ""
      await createNotification(
        userId,
        "event",
        isToday ? "Event today" : "Event tomorrow",
        `${ev.title}${timeStr}`,
        ev.id,
        ev.date
      )
    }

    // ── Todos: notify if there are incomplete tasks today ──
    const { data: todos } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .eq("completed", false)

    const pendingCount = todos?.length ?? 0
    if (pendingCount > 0) {
      await createNotification(
        userId,
        "todo",
        "Tasks for today",
        `You have ${pendingCount} task${pendingCount > 1 ? "s" : ""} to complete today.`,
        undefined,
        today
      )
    }

    // ── Challenges: remind to mark done if not yet ──
    const { data: challenges } = await supabase
      .from("challenges")
      .select("id, title")
      .eq("user_id", userId)
      .is("archived_at", null)

    for (const ch of challenges ?? []) {
      const { data: log } = await supabase
        .from("challenge_logs")
        .select("id")
        .eq("challenge_id", ch.id)
        .eq("date", today)
        .single()

      if (!log) {
        await createNotification(
          userId,
          "challenge",
          "Keep your streak going",
          `Don't forget to complete "${ch.title}" today.`,
          ch.id,
          today
        )
      }
    }
  } catch {
    // Silently fail — notifications are non-critical
  }
}

// ── Browser Push Notifications ─────────────────────────────────

export async function requestPushPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false

  const result = await Notification.requestPermission()
  return result === "granted"
}

export function sendBrowserNotification(title: string, body: string, icon?: string): void {
  if (!("Notification" in window)) return
  if (Notification.permission !== "granted") return

  new Notification(title, {
    body,
    icon: icon ?? "/favicon.ico",
    badge: "/favicon.ico",
    tag: `habitloom-${Date.now()}`,
  })
}

export async function triggerBrowserNotificationsForToday(userId: string): Promise<void> {
  if (!("Notification" in window) || Notification.permission !== "granted") return

  const today = getToday()
  const storageKey = `habitloom_push_${userId}_${today}`
  if (localStorage.getItem(storageKey)) return
  localStorage.setItem(storageKey, "1")

  try {
    const supabase = createClient()

    // Events today
    const { data: events } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)

    for (const ev of events ?? []) {
      const timeStr = ev.time ? ` at ${ev.time}` : ""
      sendBrowserNotification("Event today", `${ev.title}${timeStr}`)
    }

    // Incomplete todos
    const { data: todos } = await supabase
      .from("todos")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .eq("completed", false)

    if ((todos?.length ?? 0) > 0) {
      sendBrowserNotification(
        "Tasks for today",
        `You have ${todos!.length} task${todos!.length > 1 ? "s" : ""} pending.`
      )
    }
  } catch {
    // Silently fail
  }
}

// ── Helpers ────────────────────────────────────────────────────

function getDateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

function mapNotification(row: Record<string, unknown>): AppNotification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as NotificationType,
    title: row.title as string,
    body: row.body as string,
    refId: (row.ref_id as string) ?? undefined,
    refDate: (row.ref_date as string) ?? undefined,
    read: row.read as boolean,
    createdAt: row.created_at as string,
  }
}
