import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const correctionSchema = z.object({
  mikvah_id: z.string().uuid(),
  type: z.enum(['incorrect_info', 'missing_info', 'outdated_info', 'other']),
  field: z.string().optional(),
  current_value: z.string().optional(),
  suggested_value: z.string().min(1),
  description: z.string().min(10),
  contact_email: z.string().email().optional().or(z.literal('')),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = correctionSchema.parse(body)

    const supabase = createClient()

    // Insert the correction
    const { data, error } = await supabase
      .from('corrections')
      .insert({
        mikvah_id: validatedData.mikvah_id,
        type: validatedData.type,
        field: validatedData.field,
        current_value: validatedData.current_value,
        suggested_value: validatedData.suggested_value,
        description: validatedData.description,
        contact_email: validatedData.contact_email || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating correction:', error)
      return NextResponse.json(
        { error: 'Failed to submit correction' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Correction submitted successfully',
        id: data.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing correction:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const mikvahId = searchParams.get('mikvah_id')
    const status = searchParams.get('status') || 'pending'

    let query = supabase
      .from('corrections')
      .select(`
        *,
        mikvahs (
          id,
          name_en,
          name_he,
          address
        )
      `)
      .order('created_at', { ascending: false })

    if (mikvahId) {
      query = query.eq('mikvah_id', mikvahId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching corrections:', error)
      return NextResponse.json(
        { error: 'Failed to fetch corrections' },
        { status: 500 }
      )
    }

    return NextResponse.json({ corrections: data })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
