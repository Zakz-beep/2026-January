import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // ✅ FIX: Gunakan request.url, bukan request langsung
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    // Validasi code ada
    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    // ✅ FIX: Await cookies() untuk Next.js 15+
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Ignore error dalam middleware
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )

    // Tukar code dengan session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error.message)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    if (!data.session || !data.user) {
      console.error('No session or user data received')
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    // ✅ BETTER: Cek role dari user metadata atau database
    // Ini contoh sederhana, idealnya cek dari database
    const isAdmin = data.user.email === 'muhammadakbaralfiansyah@gmail.com'
    
    if (isAdmin) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/dashboard`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/dashboard`)
      }
      
      return NextResponse.redirect(`${origin}/dashboard`)
    }
    
    // User biasa: redirect ke halaman asal
    return NextResponse.redirect(`${origin}${next}`)

  } catch (error) {
    // ✅ FIX: Tangkap semua error tak terduga
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/auth-code-error`)
  }
}