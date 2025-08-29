import { NextResponse } from "next/server"

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Mock file data
    const fileContent = "This is a sample file content for demonstration purposes."

    // Create a Response with the file content
    return new Response(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename="sample-${fileId}.txt"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to download file", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
