
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { sheetId, range } = await req.json()
    
    if (!sheetId || !range) {
      throw new Error('Sheet ID and range are required')
    }

    // Fetch data from Google Sheets
    const googleSheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${Deno.env.get('GOOGLE_SHEETS_API_KEY')}`
    
    const response = await fetch(googleSheetsUrl)
    const data = await response.json()
    
    if (!data.values) {
      throw new Error('No data found in sheet')
    }

    // Clear existing data
    await supabase.from('google_sheets_data').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Process and insert new data
    const rows = data.values.slice(1) // Skip header row
    const insertData = rows.map((row: string[], index: number) => ({
      type: row[0]?.toLowerCase() || 'file',
      title: row[1] || `Item ${index + 1}`,
      link: row[2] || null,
      parent_section: row[3] || null,
      order_index: index
    }))

    const { error } = await supabase
      .from('google_sheets_data')
      .insert(insertData)

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${insertData.length} items`,
        count: insertData.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error syncing Google Sheets:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
