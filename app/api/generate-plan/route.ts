import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdf-loader";
import { generateStudyPlan } from "@/lib/ai";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const examDate = formData.get("examDate") as string;
    const ageStr = formData.get("age") as string | null;
    const age = ageStr ? parseInt(ageStr, 10) : undefined;

    if (!file || !examDate) {
      return NextResponse.json(
        { error: "File and exam date are required" },
        { status: 400 }
      );
    }

    // Get user ID from auth header to fetch questionnaire
    const authHeader = req.headers.get("authorization");
    let questionnaire: any = null;

    if (authHeader && supabaseServer) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabaseServer.auth.getUser(token);
        
        if (user) {
          const { data } = await supabaseServer
            .from("user_questionnaire")
            .select("*")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle();
          
          questionnaire = data;
        }
      } catch (e) {
        console.log("Could not fetch questionnaire, proceeding without it");
      }
    }

    // Calculate days until exam
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam.getTime() - today.getTime();
    const daysUntilExam = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysUntilExam <= 0) {
      return NextResponse.json(
        { error: "Exam date must be in the future" },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text (currently only supporting PDF, but could extend)
    let content = "";
    if (file.type === "application/pdf") {
      try {
        content = await extractTextFromPdf(buffer);
      } catch (pdfError: any) {
        console.error("PDF Extraction failed:", pdfError);
        return NextResponse.json(
          { error: `Failed to read PDF file: ${pdfError.message}` },
          { status: 400 }
        );
      }
    } else {
      // For now, just treat other text-based files as plain text if possible, or throw
      // You might want to add support for DOCX/PPTX later
      return NextResponse.json(
        { error: "Only PDF files are currently supported for AI analysis" },
        { status: 400 }
      );
    }

    // Generate plan
    console.log(`Generating plan with Gemini... Content length: ${content.length} characters`);
    console.log(`Extracted Text Preview: ${content.substring(0, 200)}...`);
    
    const plan = await generateStudyPlan(content, examDate, daysUntilExam, age, questionnaire);
    console.log("Plan generated successfully:", plan.length, "days");

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("Error in generate-plan API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
