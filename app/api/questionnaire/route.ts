import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Supabase server not configured" },
        { status: 500 }
      )
    }

    // Get user from auth header
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      age_group,
      current_status,
      primary_goal,
      pursuing,
      primary_domain,
      explanation_preference,
    } = body

    if (!age_group || !current_status || !primary_goal || !pursuing || !primary_domain || !explanation_preference) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from("user_questionnaire")
      .upsert({
        user_id: user.id,
        age_group,
        current_status,
        primary_goal,
        pursuing,
        primary_domain,
        explanation_preference,
      }, { onConflict: "user_id" })

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Questionnaire saved successfully",
      data,
    })
  } catch (error: any) {
    console.error("Error in questionnaire API:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: "Supabase server not configured" },
        { status: 500 }
      )
    }

    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data, error } = await supabaseServer
      .from("user_questionnaire")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({
      success: true,
      questionnaire: data,
    })
  } catch (error: any) {
    console.error("Error fetching questionnaire:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
