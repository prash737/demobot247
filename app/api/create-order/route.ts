import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<Response> {
  try {
    const { amount } = await request.json()

    if (!amount || typeof amount !== "number") {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    // Mock order creation
    const orderId = `order_${Date.now()}`

    return NextResponse.json({ orderId }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
