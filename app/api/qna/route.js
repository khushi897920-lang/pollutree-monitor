import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({
        success: false,
        answer: "No question provided"
      });
    }

    // 1️⃣ Fetch latest AQI reading
    const { data, error } = await supabase
      .from("aqi_readings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return NextResponse.json({
        success: false,
        answer: "AQI data unavailable"
      });
    }

    const latest = data[0];

    // 2️⃣ Get answer using helper
    const { chatbotResponse } = await import('@/lib/gemini');
    const answer = await chatbotResponse(question, latest);

    return NextResponse.json({
      success: true,
      answer
    });

  } catch (error) {
    console.error("QNA ERROR:", error);

    return NextResponse.json({
      success: false,
      answer: "AI failed to respond"
    });
  }
}