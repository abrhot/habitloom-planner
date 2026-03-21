"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession, signIn, signUp } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, CheckSquare, Calendar, ArrowRight, Eye, EyeOff } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getSession().then((session) => {
      if (session) router.push("/dashboard")
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
        router.push("/dashboard")
      } else {
        if (!name.trim()) { setError("Name is required"); setIsLoading(false); return }
        await signUp(email, password, name)
        // Supabase may require email confirmation depending on settings
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Target,      title: "Habit Challenges",  desc: "Track daily consistency with visual streak grids" },
    { icon: CheckSquare, title: "Daily Tasks",        desc: "Prioritize and complete your to-do list every day" },
    { icon: Calendar,    title: "Event Planning",     desc: "Schedule events with countdown timers and reminders" },
  ]

  return (
    <div className="min-h-screen flex bg-background">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] gradient-hero flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-white" />
            </div>
            <span className="text-base font-semibold text-white">Habitloom</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-white leading-snug mb-3">
              Build better habits,<br />
              one day at a time.
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              A focused space to track your challenges, manage daily tasks, and stay on top of your schedule.
            </p>
          </div>

          <div className="space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-white/80" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/25 text-xs">&copy; 2026 Habitloom</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm animate-in-up">

          {/* Mobile wordmark */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary-foreground" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-foreground">Habitloom</span>
          </div>

          <div className="mb-7">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {isLogin ? "Sign in" : "Create account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Continue building your habits" : "Start tracking your daily progress"}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex p-0.5 bg-secondary rounded-md mb-6 text-sm">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError("") }}
              className={`flex-1 py-2 rounded font-medium transition-colors ${
                isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError("") }}
              className={`flex-1 py-2 rounded font-medium transition-colors ${
                !isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-label">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-10 text-sm"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-label">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-label">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="h-10 text-sm pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/8 border border-destructive/15 rounded px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-10 gradient-primary text-primary-foreground text-sm font-medium btn-press mt-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Please wait...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {isLogin ? "No account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError("") }}
              className="text-foreground font-medium hover:underline underline-offset-2"
            >
              {isLogin ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
