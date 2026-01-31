import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
// Dedicated client for content generation (allows using a separate rate limit/key)
const groqContent = new Groq({ apiKey: process.env.GROQ_CONTENT_API_KEY || process.env.GROQ_API_KEY || "" });

export interface StudyPlanDay {
  day: number;
  title: string;
  topics: string[];
  estimatedTime: string;
}

export async function generateStudyPlan(
  content: string,
  examDate: string,
  daysUntilExam: number,
  age?: number,
  questionnaire?: any
): Promise<StudyPlanDay[]> {
  
  // Build personalization context from questionnaire
  const personalization = questionnaire
    ? `
Learner Profile:
- Age Group: ${questionnaire.age_group || "unknown"}
- Current Status: ${questionnaire.current_status || "unknown"}
- Primary Goal: ${questionnaire.primary_goal || "unknown"}
- Pursuing: ${questionnaire.pursuing || "unknown"}
- Domain: ${questionnaire.primary_domain || "unknown"}
- Explanation Preference: ${questionnaire.explanation_preference || "unknown"}

Personalization Guidelines:
1. If domain is "${questionnaire.primary_domain}", focus on domain-specific approaches and examples.
2. Goal "${questionnaire.primary_goal}" suggests focusing on ${
        questionnaire.primary_goal.includes("Placement")
          ? "interview/coding problems and practical skills"
          : questionnaire.primary_goal.includes("Certification")
            ? "certification-specific topics and exam patterns"
            : questionnaire.primary_goal.includes("Skill")
              ? "hands-on projects and real-world applications"
              : "comprehensive exam coverage"
      }.
3. Status "${questionnaire.current_status}" means tailor depth and pace accordingly.
4. "${questionnaire.explanation_preference}" preference: ${
        questionnaire.explanation_preference.includes("detailed")
          ? "provide detailed, in-depth explanations; include more examples and edge cases"
          : "keep explanations concise and fast-paced; focus on key concepts only"
      }.
    `
    : "";
  
  // Try Groq First (Primary)
  try {
    console.log("Generating study plan with Groq (llama-3.3-70b-versatile)...");
    const groqCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert study planner. Return ONLY valid JSON array. No markdown.
          Schema: [{"day": 1, "title": "...", "topics": ["..."], "estimatedTime": "..."}]`
        },
        {
          role: "user",
          content: `Exam Date: ${examDate}. Days Remaining: ${daysUntilExam}.
          Create a comprehensive, day-by-day study plan to master the material provided below.
          Learner Age: ${age ?? "unknown"}. Adjust tone, complexity, and examples to be age-appropriate.
          
          ${personalization}
          
          INSTRUCTIONS:
          1. Analyze the provided study material content thoroughly.
          2. Distribute topics logically over the available days.
          3. Ensure the plan is balanced.
          4. If age is provided, simplify explanations and suggest age-appropriate practice (e.g., more visuals for younger learners, exam strategies for adults).
          
          OUTPUT FORMAT:
          Return a JSON array of objects. Each object represents a study day.
          Schema:
          [
            {
              "day": number,
              "title": "string",
              "topics": ["string", "string"],
              "estimatedTime": "string"
            }
          ]

          STUDY MATERIAL CONTENT:
          ${content.substring(0, 30000)}` // Reduced limit to ~30k chars (approx 7.5k tokens) to fit Groq's free tier 12k TPM limit
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const groqText = groqCompletion.choices[0]?.message?.content || "[]";
    const cleanGroqText = groqText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanGroqText);

  } catch (groqError) {
    console.error("Error generating study plan with Groq:", groqError);
    console.log("Falling back to Gemini...");

    // Fallback to Gemini
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const prompt = `
        You are an expert academic study planner and curriculum designer.
        
        CONTEXT:
        - Exam Date: ${examDate}
        - Days Remaining: ${daysUntilExam}
        - Learner Age: ${age ?? "unknown"}
        - Goal: Create a comprehensive, day-by-day study plan to master the material provided below.
        
        ${personalization}
        
        INSTRUCTIONS:
        1. Analyze the provided study material content thoroughly. Identify key modules, chapters, and topics.
        2. Distribute these topics logically over the available days (up to a maximum of 30 days).
        3. Ensure the plan is balanced: mix heavy theoretical topics with lighter review or practice sessions.
        4. If the exam is very close (e.g., < 5 days), create an intensive "cramming" schedule focusing on high-yield topics.
        5. If the exam is far away, create a paced schedule with built-in review days.
        6. Adjust tone, complexity, and practice suggestions to be age-appropriate. If age is unknown, assume adult learner.
        
        OUTPUT FORMAT:
        Return a JSON array of objects. Each object represents a study day.
        Schema:
        [
          {
            "day": number, // 1, 2, 3...
            "title": "string", // Brief title of the day's focus (e.g., "Chapter 1: Algebra Basics")
            "topics": ["string", "string"], // List of 3-5 specific sub-topics to cover
            "estimatedTime": "string" // e.g., "2 hours", "4 hours"
          }
        ]

        STUDY MATERIAL CONTENT:
        ${content.substring(0, 500000)} // Increased limit for Gemini 1.5 Flash
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const plan: StudyPlanDay[] = JSON.parse(text);
      return plan;

    } catch (geminiError: any) {
      console.error("Error generating study plan with Gemini:", geminiError);
      if (geminiError.response) {
        console.error("Gemini Response Error Details:", JSON.stringify(geminiError.response, null, 2));
      }
      throw new Error("Failed to generate study plan with both Groq and Gemini.");
    }
  }
}

export async function generateLessonContent(topic: string): Promise<string> {
  try {
    console.log(`Generating lesson content for: ${topic} with Groq (Content Key)...`);
    const completion = await groqContent.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert educational content creator. Your task is to generate high-quality, comprehensive learning material for a specific topic.
          
          OUTPUT FORMAT:
          Return ONLY raw HTML. Do not include markdown code blocks (like \`\`\`html).
          Use Tailwind CSS classes for styling.
          
          DESIGN GUIDELINES:
          - Use a clean, professional layout.
          - Use colors like bg-blue-50, text-blue-900, border-blue-500 for highlights.
          - Use bg-gray-50, border-gray-200 for sections.
          - Include a "Key Insight" box at the start.
          - Use clear headings (h3, h4) and paragraph tags.
          - If appropriate for the topic, include a comparison table or a step-by-step list.
          - Do NOT use generic placeholders like "Introduction to [Topic]". Write the actual content.
          - The content should be educational, factual, and detailed (approx. 300-500 words).
          
          STRUCTURE:
          1. Brief Introduction (Directly explaining what it is).
          2. Key Insight Box (A crucial takeaway).
          3. Core Concepts / Historical Context / Architecture / Process (Choose the most relevant structure for the topic).
          4. Detailed Explanation (Use lists, bold text, etc.).
          5. Practical Application or Example.
          `
        },
        {
          role: "user",
          content: `Generate a lesson module for the topic: "${topic}".`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 2048,
    });

    let content = completion.choices[0]?.message?.content || "<p>Failed to generate content.</p>";
    
    // Clean up markdown code blocks if present
    content = content.replace(/```html/g, '').replace(/```/g, '');
    
    return content;
  } catch (error) {
    console.error("Error generating lesson content:", error);
    return "<p>Error generating content. Please try again later.</p>";
  }
}
