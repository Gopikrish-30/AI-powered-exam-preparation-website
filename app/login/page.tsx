"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ShieldCheck, Sparkles, UserPlus } from "lucide-react"
import { supabaseClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    console.log("=== AUTH DEBUG START ===")
    console.log("Mode:", mode)
    console.log("Email:", email)
    console.log("Supabase Client exists:", !!supabaseClient)
    console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (!supabaseClient) {
      const errorMsg = "Supabase is not configured. Check browser console for env variables."
      console.error(errorMsg)
      console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log("Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      setError(errorMsg)
      setLoading(false)
      return
    }

    try {
      if (mode === "signup") {
        console.log("Attempting sign up...")
        const { data, error: signUpError } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/`,
          },
        })
        console.log("Sign up response:", { data, error: signUpError })
        if (signUpError) throw signUpError
        console.log("✅ Sign up successful! User:", data.user?.id)
        
        // Check if email confirmation is required
        if (data.user && !data.session) {
          alert("✅ Account created! Please check your email to confirm your account before logging in.")
          setMode("login")
          return
        }
      } else {
        console.log("Attempting sign in...")
        const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password })
        console.log("Sign in response:", { data, error: signInError })
        if (signInError) throw signInError
        console.log("✅ Sign in successful! User:", data.user?.id)
      }

      // After login, check if profile exists; if not, go to onboarding
      try {
        const { data: { session } } = await supabaseClient.auth.getSession()
        const userId = session?.user?.id
        if (userId) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle()

          if (!profile) {
            router.push('/onboarding')
          } else {
            router.push('/')
          }
        } else {
          router.push('/')
        }
      } catch (e) {
        router.push('/')
      }
    } catch (authError: any) {
      console.error("❌ Auth error:", authError)
      setError(authError.message || "Authentication failed")
    } finally {
      setLoading(false)
      console.log("=== AUTH DEBUG END ===")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SmartExam Prep</span>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 grid lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">Study faster with AI</Badge>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-lg text-gray-600 max-w-xl">
            Securely sign in to track your personalized study plans, revisit previous schedules, and stay on top of exam
            prep.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {[{ title: "Secure by design", icon: ShieldCheck, body: "Your study data stays private and encrypted." },
              { title: "Adaptive plans", icon: Sparkles, body: "Plans adjust as you create more study sessions." },
              { title: "One-click start", icon: UserPlus, body: "Jump into your dashboard in seconds." },
              { title: "Progress sync", icon: BookOpen, body: "Revisit past plans any time on any device." }].map(({ title, icon: Icon, body }) => (
              <Card key={title} className="bg-white/90 border border-gray-100 shadow-sm">
                <CardContent className="p-4 flex space-x-3 items-start">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-600">{body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="max-w-xl w-full mx-auto shadow-xl border-0 bg-white/95">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>{mode === "login" ? "Sign in" : "Sign up"}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode((prev) => (prev === "login" ? "signup" : "login"))}
              >
                {mode === "login" ? "Create account" : "Have an account?"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    placeholder="Alex Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {mode === "signup" && (
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our terms of service and privacy policy.
                </p>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                {loading ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
              </Button>

              {/* Debug info */}
              <details className="text-xs text-gray-500 mt-4">
                <summary className="cursor-pointer">Debug Info</summary>
                <div className="mt-2 p-2 bg-gray-50 rounded font-mono space-y-1">
                  <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ NOT SET"}</div>
                  <div>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ SET" : "❌ NOT SET"}</div>
                  <div>Client Ready: {supabaseClient ? "✅ YES" : "❌ NO"}</div>
                </div>
              </details>
            </form>

            <Separator className="my-6" />

            <div className="text-sm text-gray-600 text-center">
              <span className="mr-1">Need to return later?</span>
              <Link href="/" className="text-blue-600 hover:underline font-medium">
                Go back to homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
