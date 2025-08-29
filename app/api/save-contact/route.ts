import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client for server-side operations using the service key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables for server-side operations.")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const MAX_WEBSITES_PER_LEAD = 5

export async function POST(req: Request) {
  try {
    const { url, email, phone, countryCode } = await req.json()

    if (!url || !email || !phone || !countryCode) {
      return NextResponse.json({ error: "URL, email, phone, and country code are required" }, { status: 400 })
    }

    // 1. Find or Create Lead in demo_leads table
    let { data: lead, error: leadError } = await supabase
      .from("demo_leads")
      .select("id")
      .eq("email", email)
      .eq("phone_number", phone)
      .eq("country_code", countryCode)
      .single()

    if (leadError && leadError.code === "PGRST116") {
      // No rows found, create new lead
      const { data: newLead, error: insertError } = await supabase
        .from("demo_leads")
        .insert({ email, phone_number: phone, country_code: countryCode })
        .select("id")
        .single()

      if (insertError) {
        console.error("Supabase insert lead error:", insertError)
        return NextResponse.json({ error: "Failed to create new lead." }, { status: 500 })
      }
      lead = newLead
    } else if (leadError) {
      console.error("Supabase fetch lead error:", leadError)
      return NextResponse.json({ error: "Failed to retrieve lead information." }, { status: 500 })
    }

    if (!lead) {
      return NextResponse.json({ error: "Lead not found or created." }, { status: 500 })
    }

    const leadId = lead.id

    // 2. Count Total Websites Launched by this Lead (regardless of uniqueness)
    const { count: launchedWebsitesCount, error: countError } = await supabase
      .from("lead_website_launches")
      .select("id", { count: "exact" }) // Count all entries for this lead
      .eq("lead_id", leadId)

    if (countError) {
      console.error("Supabase count launches error:", countError)
      return NextResponse.json({ error: "Failed to count launched websites." }, { status: 500 })
    }

    if (launchedWebsitesCount && launchedWebsitesCount >= MAX_WEBSITES_PER_LEAD) {
      return NextResponse.json(
        {
          error: `You have reached the limit of ${MAX_WEBSITES_PER_LEAD} website launches with this contact.`,
        },
        { status: 403 }, // Forbidden
      )
    }

    // 3. Record New Launch (always insert, as the limit is on total launches)
    const { error: recordLaunchError } = await supabase
      .from("lead_website_launches")
      .insert({ lead_id: leadId, website_url: url }) // Insert the current website URL

    if (recordLaunchError) {
      console.error("Supabase record launch error:", recordLaunchError)
      return NextResponse.json({ error: "Failed to record website launch." }, { status: 500 })
    }

    return NextResponse.json({ message: "Contact data and website launch recorded successfully" })
  } catch (generalError: any) {
    console.error("General error in save-contact API:", generalError)
    return NextResponse.json({ error: `An unexpected error occurred: ${generalError.message}` }, { status: 500 })
  }
}
