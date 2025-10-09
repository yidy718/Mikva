import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Create admin client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Get user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')

    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 })
    }

    // Combine users with their roles
    const usersWithRoles = users.map(user => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
      role: roles?.find(r => r.user_id === user.id)?.role || 'user'
    }))

    return NextResponse.json(usersWithRoles)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
