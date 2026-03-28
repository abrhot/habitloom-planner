import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type ChallengeSuggestion = { title: string; color?: string }
type EventSuggestion = { title: string; date?: string; note?: string; color?: string }

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { message } = (await request.json()) as { message?: string }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().slice(0, 10)

    const [{ data: events }, { data: challenges }, { data: todos }] = await Promise.all([
      supabase
        .from("events")
        .select("id,title,date,time,note,color")
        .eq("user_id", user.id)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(20),
      supabase
        .from("challenges")
        .select("id,title,color,archived_at")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .limit(20),
      supabase
        .from("todos")
        .select("id,text,date,completed,priority")
        .eq("user_id", user.id)
        .eq("date", today)
        .limit(30),
    ])

    const context = {
      today,
      events: events ?? [],
      activeChallenges: challenges ?? [],
      todaysTodos: todos ?? [],
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      const fallback = fallbackAssistant(message, context)
      return NextResponse.json(fallback)
    }

    const system = `
You are Habitloom AI Coach. Your job:
1) Build practical roadmaps for learning goals.
2) Convert roadmap items into actionable habit challenges.
3) Suggest relevant global/industry events the user may want to add.

Rules:
- Keep outputs concise and practical.
- Respect the user's existing schedule/events in CONTEXT.
- If suggesting events, provide realistic YYYY-MM-DD date only when confident; otherwise omit date.
- Challenges must be short, measurable, and daily/weekly actionable.
- Never use markdown in JSON fields.

Return STRICT JSON with this shape:
{
  "reply": "string",
  "suggestedChallenges": [{ "title": "string", "color": "#hexOptional" }],
  "suggestedEvents": [{ "title": "string", "date": "YYYY-MM-DD optional", "note": "string optional", "color": "#hexOptional" }]
}
`

    const userPrompt = `
USER_MESSAGE:
${message}

CONTEXT:
${JSON.stringify(context)}
`

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
    })

    if (!completion.ok) {
      const fallback = fallbackAssistant(message, context)
      return NextResponse.json(fallback)
    }

    const data = (await completion.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const raw = data.choices?.[0]?.message?.content ?? ""
    const parsed = parseAssistantJson(raw)
    if (!parsed) {
      const fallback = fallbackAssistant(message, context)
      return NextResponse.json(fallback)
    }

    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 })
  }
}

function parseAssistantJson(raw: string): {
  reply: string
  suggestedChallenges: ChallengeSuggestion[]
  suggestedEvents: EventSuggestion[]
} | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim()
    const obj = JSON.parse(cleaned) as {
      reply?: string
      suggestedChallenges?: ChallengeSuggestion[]
      suggestedEvents?: EventSuggestion[]
    }
    if (!obj.reply) return null
    return {
      reply: obj.reply,
      suggestedChallenges: Array.isArray(obj.suggestedChallenges) ? obj.suggestedChallenges : [],
      suggestedEvents: Array.isArray(obj.suggestedEvents) ? obj.suggestedEvents : [],
    }
  } catch {
    return null
  }
}

function fallbackAssistant(
  message: string,
  context: { today: string; events: unknown[]; activeChallenges: unknown[]; todaysTodos: unknown[] }
) {
  const lower = message.toLowerCase()
  const isRoadmap = /roadmap|learn|study|skill|language|program/i.test(lower)

  const challenges: ChallengeSuggestion[] = isRoadmap
    ? [
        { title: "45-minute focused learning block", color: "#4f46e5" },
        { title: "Build one mini project milestone", color: "#059669" },
        { title: "Daily recap notes (10 minutes)", color: "#d97706" },
      ]
    : [
        { title: "Plan top 3 priorities for tomorrow", color: "#4f46e5" },
        { title: "Deep work sprint (60 minutes)", color: "#059669" },
      ]

  const reply = isRoadmap
    ? `Here is a structured starter roadmap: define your target outcome, split it into weekly milestones, and track daily execution with small measurable steps. I generated challenge ideas below that you can create in one click. I also considered your current schedule when proposing this.`
    : `I can help you turn any goal into a roadmap and trackable challenges. Share your target (e.g., "learn React in 6 weeks") and I will produce a clear week-by-week plan with challenge suggestions.`

  return {
    reply,
    suggestedChallenges: challenges,
    suggestedEvents: [
      {
        title: "Review upcoming industry webinars",
        note: `Based on your current planning load (${context.events.length} upcoming events).`,
        color: "#0284c7",
      },
    ],
  }
}
