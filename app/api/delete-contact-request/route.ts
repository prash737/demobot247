import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase environment variables are not set for delete-contact-request API.")
    return NextResponse.json({ message: "Server configuration error: Supabase credentials missing." }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ message: "Request ID is required for deletion." }, { status: 400 })
    }

    const { error } = await supabase.from("contact_requests").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Contact request deleted successfully!" }, { status: 200 })
  } catch (error) {
    console.error("Request processing error during deletion:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred while processing your delete request." },
      { status: 500 },
    )
  }
}
