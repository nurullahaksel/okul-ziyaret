import { useState, useEffect } from "react"
import { supabase } from "./lib/supabase"
import HomePage from "./components/HomePage"
import LoginPage from "./components/LoginPage"
import AdminPanel from "./components/AdminPanel"
import BookingPage from "./components/BookingPage"

export default function App() {
  const [view, setView] = useState("home") // home | login | admin | booking
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (view === "admin" && session) return
    if (view === "admin" && !session) setView("login")
  }, [view, session])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setView("home")
  }

  if (view === "login") return <LoginPage onSuccess={() => setView("admin")} onBack={() => setView("home")} />
  if (view === "admin" && session) return <AdminPanel session={session} onLogout={handleLogout} />
  if (view === "booking") return <BookingPage onBack={() => setView("home")} />
  return <HomePage onAdminClick={() => setView("login")} onBookingClick={() => setView("booking")} />
}
