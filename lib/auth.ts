import { createClient } from "./supabase/client"

export async function signUp(email: string, password: string, name: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  })

  if (error) throw new Error(error.message)
  return data.user
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)
  return data.user
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return profile
    ? { id: profile.id, email: profile.email, name: profile.name, createdAt: profile.created_at }
    : null
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
