import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import type { StudyPlanDay } from "@/lib/ai"

interface IncomingPlan {
  userId?: string
  title: string
  examDate: string
  files: string[]
  plan: StudyPlanDay[]
}

export async function POST(request: Request) {
  if (!supabaseServer) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })
  }

  try {
    const body = (await request.json()) as IncomingPlan
    if (!body.examDate || !Array.isArray(body.plan)) {
      return NextResponse.json({ error: "Missing examDate or plan" }, { status: 400 })
    }

    const { data, error } = await supabaseServer.from("study_plans").insert({
      user_id: body.userId || null,
      title: body.title,
      exam_date: body.examDate,
      files: body.files ?? [],
      plan: body.plan,
    }).select("id, created_at, title, exam_date, files, plan").single()

    if (error) {
      console.error("Supabase insert error", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ plan: data })
  } catch (error: any) {
    console.error("Error saving plan", error)
    return NextResponse.json({ error: error.message || "Unexpected error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  if (!supabaseServer) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from("study_plans")
    .select("id, created_at, title, exam_date, files, plan")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Supabase fetch error", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ plans: data })
}
