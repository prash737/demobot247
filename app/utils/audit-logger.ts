import type { SupabaseClient } from "@supabase/supabase-js"

export async function logAuditEvent(
  supabase: SupabaseClient,
  chatbotId: string,
  actorType: "admin" | "user",
  action: string, // New parameter for the action string
  details: any, // Renamed from 'changes' to 'details' for clarity
) {
  try {
    // Get session using the passed supabase client
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Error getting session for audit log:", sessionError)
      return
    }

    const userId = sessionData?.session?.user?.id || null

    // Use the passed supabase client to interact with the database
    const { error } = await supabase.from("audit_logs").insert({
      chatbot_id: chatbotId,
      user_id: userId,
      actor_type: actorType,
      action: action, // Use the new 'action' parameter
      details: details, // Use the new 'details' parameter
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("Error logging audit event to DB:", error)
    }
  } catch (error) {
    console.error("Unexpected error in logAuditEvent:", error)
  }
}
