import { NextResponse } from "next/server"
import { supabaseForgotPassword } from "@/app/utils/supabaseClientForgotPassword"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    const { error } = await supabaseForgotPassword.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) throw error

    return NextResponse.json({ message: "Password reset email sent successfully" })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Failed to send password reset email" }, { status: 500 })
  }
}
