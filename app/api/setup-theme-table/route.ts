import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing Supabase environment variables for server-side operations.")
  // Return a mock client during build time
  const mockClient = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null })
    }),
    rpc: () => Promise.resolve({ data: [], error: null })
  }
}

const supabase = (supabaseUrl && supabaseServiceKey) ? 
  createClient(supabaseUrl, supabaseServiceKey) : 
  null

export async function GET() {
  try {
    // Return early if no Supabase client (build time)
    if (!supabase) {
      return NextResponse.json({ 
        message: "Database operations not available during build time" 
      }, { status: 200 })
    }

    // Check if the table exists
    const { data: tables, error: tablesError } = await supabase
      .from("pg_tables")
      .select("tablename")
      .eq("schemaname", "public")
      .eq("tablename", "chatbot_themes")

    if (tablesError) {
      console.error("Error checking for table:", tablesError)
      return NextResponse.json({ error: tablesError.message }, { status: 500 })
    }

    // If table doesn't exist, create it
    if (!tables || tables.length === 0) {
      // We can't create tables directly with the JavaScript client
      // This is just to inform the user that the table needs to be created
      return NextResponse.json(
        {
          error: "The chatbot_themes table does not exist. Please create it with the following SQL:",
          sql: `
          CREATE TABLE public.chatbot_themes (
            id SERIAL PRIMARY KEY,
            chatbot_id TEXT NOT NULL,
            primary_color TEXT NOT NULL,
            secondary_color TEXT NOT NULL,
            border_radius INTEGER NOT NULL,
            avatar_url TEXT,
            dark_mode BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(chatbot_id)
          );
        `,
        },
        { status: 404 },
      )
    }

    // Create embed_domains table if it doesn't exist
    const { error: embedDomainsTableError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS embed_domains (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        chatbot_id TEXT NOT NULL,
        domains JSONB DEFAULT '{"links":[]}',
        UNIQUE(chatbot_id)
      );
    `)

    if (embedDomainsTableError) {
      console.error("Error creating embed_domains table:", embedDomainsTableError)
      return NextResponse.json({ error: "Failed to create embed_domains table" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Table exists" })
  } catch (error) {
    console.error("Error in setup-theme-table API route:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    // Return early if no Supabase client (build time)
    if (!supabase) {
      return NextResponse.json({ 
        message: "Database operations not available during build time" 
      }, { status: 200 })
    }

    // First, check if the table exists
    const { data: existingTables, error: tableCheckError } = await supabase.rpc('check_table_exists', { table_name: 'theme' })

    console.log('Table check result:', { existingTables, tableCheckError })

    if (tableCheckError) {
      console.error('Error checking for table:', tableCheckError)
    }