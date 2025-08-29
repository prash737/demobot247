import { NextResponse } from "next/server"
import { verifyPassword } from "@/app/utils/auth-utils"

export async function POST(request: Request) {
  try {
    const { plainPassword, hashedPassword } = await request.json()

    if (!plainPassword || !hashedPassword) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const isValid = await verifyPassword(plainPassword, hashedPassword)

    return NextResponse.json({ isValid })
  } catch (error) {
    console.error("Error verifying password:", error)
    return NextResponse.json({ error: "Failed to verify password" }, { status: 500 })
  }
}
