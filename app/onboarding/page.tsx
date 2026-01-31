"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [age, setAge] = useState<number | "">("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (!supabaseClient) {
        router.push('/login')
        return
      }
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      const user = session.user
      setEmail(user.email || "")
      setFullName(user.user_metadata?.full_name || "")

      // Check questionnaire first
      const { data: questionnaire } = await supabaseClient
        .from('user_questionnaire')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (!questionnaire) {
        router.push('/questionnaire')
        return
      }

      // If profile already exists, skip onboarding
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('id, age')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (profile) {
        router.push('/')
      }
    }

    init()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (!supabaseClient) {
      router.push('/login')
      return
    }
    const { data: { session } } = await supabaseClient.auth.getSession()
    const user = session?.user
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const { error } = await supabaseClient
        .from('profiles')
        .upsert({
          user_id: user.id,
          email,
          full_name: fullName || (email ? email.split('@')[0] : ''),
          age: typeof age === 'string' ? parseInt(age, 10) : age ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

      if (error) throw error
      router.push('/')
    } catch (err: any) {
      alert(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Welcome! Tell us about you</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-xl mx-auto bg-white/95 border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Alex Doe" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} readOnly className="bg-gray-100" />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" min={5} max={120} value={age as number | undefined} onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : "")} placeholder="e.g. 16" />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Continue'}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
