"use client"

import { useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<string>("Checking...")
  const [user, setUser] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>("")

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (!supabaseClient) {
      setStatus("❌ Supabase client not initialized. Check env variables.")
      return
    }

    try {
      // Test auth
      const { data: sessionData } = await supabaseClient.auth.getSession()
      setUser(sessionData.session?.user || null)
      
      if (sessionData.session?.user) {
        setStatus(`✅ Connected! Logged in as: ${sessionData.session.user.email}`)
      } else {
        setStatus("⚠️ Connected but not logged in")
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`)
    }
  }

  const testInsert = async () => {
    if (!user) {
      setTestResult("❌ Please log in first")
      return
    }

    try {
      const testPlan = {
        userId: user.id,
        title: "Test Plan",
        examDate: new Date().toISOString().split('T')[0],
        files: ["test.pdf"],
        plan: [{ day: 1, title: "Test Day", topics: ["Test Topic"], estimatedTime: "1 hour" }]
      }

      const response = await fetch("/api/study-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPlan)
      })

      const data = await response.json()

      if (response.ok) {
        setTestResult(`✅ Test plan saved! ID: ${data.plan?.id}`)
      } else {
        setTestResult(`❌ Failed: ${data.error}`)
      }
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`)
    }
  }

  const fetchPlans = async () => {
    if (!user) {
      setTestResult("❌ Please log in first")
      return
    }

    try {
      const response = await fetch(`/api/study-plans?userId=${user.id}`)
      const data = await response.json()

      if (response.ok) {
        setTestResult(`✅ Found ${data.plans?.length || 0} plans: ${JSON.stringify(data.plans, null, 2)}`)
      } else {
        setTestResult(`❌ Failed: ${data.error}`)
      }
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Status:</strong> {status}
            </div>
            {user && (
              <div>
                <strong>User ID:</strong> {user.id}
                <br />
                <strong>Email:</strong> {user.email}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={checkConnection}>Refresh Status</Button>
              {!user && <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>}
            </div>
          </CardContent>
        </Card>

        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Database Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testInsert}>Insert Test Plan</Button>
                <Button onClick={fetchPlans} variant="outline">Fetch My Plans</Button>
              </div>
              {testResult && (
                <div className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap text-sm">
                  {testResult}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Environment Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
