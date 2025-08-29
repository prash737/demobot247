import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/app/utils/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    return NextResponse.json({ hashedPassword })
  } catch (error) {
    console.error("Error hashing password:", error)
    return NextResponse.json({ error: "Failed to hash password" }, { status: 500 })
  }
}
