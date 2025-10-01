export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function parseDate(dateString: string): Date {
  return new Date(dateString + "T00:00:00")
}

export function getToday(): string {
  return formatDate(new Date())
}

export function addDays(dateString: string, days: number): string {
  const date = parseDate(dateString)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

export function getDayName(dateString: string): string {
  const date = parseDate(dateString)
  return date.toLocaleDateString("en-US", { weekday: "long" })
}

export function getMonthName(dateString: string): string {
  const date = parseDate(dateString)
  return date.toLocaleDateString("en-US", { month: "long" })
}

export function getDayOfMonth(dateString: string): number {
  const date = parseDate(dateString)
  return date.getDate()
}

export function getYear(dateString: string): number {
  const date = parseDate(dateString)
  return date.getFullYear()
}

export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2
}

export function isToday(dateString: string): boolean {
  return isSameDay(dateString, getToday())
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function generateDateRange(startDate: string, days: number): string[] {
  const dates: string[] = []
  for (let i = 0; i < days; i++) {
    dates.push(addDays(startDate, i))
  }
  return dates
}
