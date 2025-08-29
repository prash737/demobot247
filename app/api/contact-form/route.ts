import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase environment variables are not set.")
    return NextResponse.json({ message: "Server configuration error: Supabase credentials missing." }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { name, email, phoneNumber, message } = await request.json()

    const { data, error } = await supabase
      .from("contact_requests")
      .insert([{ name, email, phone_number: phoneNumber, message }])

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Message sent successfully!", data }, { status: 200 })
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred while processing your request." },
      { status: 500 },
    )
  }
}
