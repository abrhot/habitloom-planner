"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { LayoutDashboard, CheckSquare, Calendar, User, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"
import { NotificationBell } from "@/components/notification-bell"

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    getCurrentUser().then((u) => setUserId(u?.id ?? null))
  }, [])

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/todos",     label: "Tasks",     icon: CheckSquare },
    { href: "/events",    label: "Events",    icon: Calendar },
  ]

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  return (
    <>
      {/* ── Desktop navbar ── */}
      <nav className="glass border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">

            <div className="flex items-center gap-7">
              {/* Wordmark */}
              <Link href="/dashboard" className="flex items-center gap-2 group btn-press">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                  <div className="w-2.5 h-2.5 rounded-sm bg-primary-foreground" />
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-foreground">
                  Habitloom
                </span>
              </Link>

              {/* Nav links */}
              <div className="hidden md:flex gap-0.5">
                {links.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "nav-link flex items-center gap-1.5 px-3 py-1.5 text-sm",
                        active
                          ? "active text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Notification bell */}
              {userId && <NotificationBell userId={userId} />}

              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="nav-link w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {mounted ? (
                  theme === "dark"
                    ? <Sun className="w-4 h-4" />
                    : <Moon className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4 opacity-0" />
                )}
              </button>

              {/* Profile */}
              <Link
                href="/profile"
                className={cn(
                  "nav-link flex items-center gap-1.5 px-3 py-1.5 text-sm",
                  pathname === "/profile"
                    ? "active text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
        <div className="flex items-center justify-around h-14 px-2">
          {[...links, { href: "/profile", label: "Profile", icon: User }].map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  active ? "bg-primary" : "hover:bg-secondary",
                )}>
                  <Icon className={cn("w-4 h-4", active ? "text-primary-foreground" : "")} />
                </div>
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            )
          })}

          {/* Dark mode in mobile bar */}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all text-muted-foreground hover:text-foreground"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary">
              {mounted
                ? theme === "dark"
                  ? <Sun className="w-4 h-4" />
                  : <Moon className="w-4 h-4 opacity-0" />
                : <Moon className="w-4 h-4 opacity-0" />
              }
            </div>
            <span className="text-[10px] font-semibold">Theme</span>
          </button>
        </div>
      </nav>
    </>
  )
}
