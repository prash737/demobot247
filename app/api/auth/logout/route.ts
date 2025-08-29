import { NextResponse } from "next/server"

export async function POST() {
  // This endpoint doesn't need to do anything server-side
  // since we're clearing localStorage on the client
  // But it's good to have it for future server-side logout logic

  return NextResponse.json({ success: true })
}
