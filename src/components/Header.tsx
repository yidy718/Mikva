'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { MapPin, LogOut, User, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function Header() {
  const { t, i18n } = useTranslation()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      if (session?.user) {
        checkAdminStatus(session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        checkAdminStatus(session.user.id)
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    setIsAdmin(data?.role === 'admin')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/map" className="flex items-center gap-2 font-semibold">
          <MapPin className="h-6 w-6" />
          <span>{t('map.title')}</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/map"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname === '/map' ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {t('nav.map')}
          </Link>

          {user && (
            <Link
              href="/submit"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/submit'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {t('nav.submit')}
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/admin'
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {t('nav.admin')}
            </Link>
          )}

          <Button variant="ghost" size="icon" onClick={toggleLanguage}>
            <Globe className="h-5 w-5" />
          </Button>

          {user ? (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
