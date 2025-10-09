'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { MapPin, LogOut, User, Globe, Menu, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth, useLogout } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'

export function Header() {
  const { t, i18n } = useTranslation()
  const pathname = usePathname()
  const { user, isAdmin } = useAuth()
  const logout = useLogout()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/map" className="flex items-center gap-2 font-semibold" aria-label={t('nav.home') || 'Home - Mikvah Locator'}>
          <MapPin className="h-6 w-6" aria-hidden="true" />
          <span className="hidden sm:inline">{t('map.title')}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/map"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname === '/map' ? 'text-foreground' : 'text-muted-foreground'
            )}
            aria-current={pathname === '/map' ? 'page' : undefined}
          >
            {t('nav.map')}
          </Link>

          {user && (
            <>
              <Link
                href="/submit"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === '/submit'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
                aria-current={pathname === '/submit' ? 'page' : undefined}
              >
                {t('nav.submit')}
              </Link>
              <Link
                href="/favorites"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === '/favorites'
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
                aria-current={pathname === '/favorites' ? 'page' : undefined}
              >
                <Heart className="h-4 w-4 inline mr-1" aria-hidden="true" />
                {t('nav.favorites', 'Favorites')}
              </Link>
            </>
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
              aria-current={pathname === '/admin' ? 'page' : undefined}
            >
              {t('nav.admin')}
            </Link>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                aria-label={`Switch to ${i18n.language === 'en' ? 'Hebrew' : 'English'}`}
              >
                <Globe className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Switch to {i18n.language === 'en' ? 'Hebrew' : 'English'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{i18n.language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}</p>
            </TooltipContent>
          </Tooltip>

          {user ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  aria-label={t('nav.logout') || 'Logout'}
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">{t('nav.logout') || 'Logout'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('nav.logout') || 'Logout'}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('nav.login') || 'Login'}
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">{t('nav.login') || 'Login'}</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('nav.login') || 'Login'}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          {!user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('nav.login') || 'Login'}
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">{t('nav.login') || 'Login'}</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('nav.login') || 'Login'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                aria-label={`Switch to ${i18n.language === 'en' ? 'Hebrew' : 'English'}`}
              >
                <Globe className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Switch to {i18n.language === 'en' ? 'Hebrew' : 'English'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{i18n.language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}</p>
            </TooltipContent>
          </Tooltip>

          <Sheet>
                <SheetTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('nav.menu') || 'Open navigation menu'}
                      >
                        <Menu className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">{t('nav.menu') || 'Open navigation menu'}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('nav.menu') || 'Menu'}</p>
                    </TooltipContent>
                  </Tooltip>
                </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{t('map.title')}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8" role="navigation" aria-label="Main navigation">
                <Link
                  href="/map"
                  className={cn(
                    'text-lg font-medium transition-colors hover:text-primary py-2',
                    pathname === '/map' ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  aria-current={pathname === '/map' ? 'page' : undefined}
                >
                  {t('nav.map')}
                </Link>

                {user && (
                  <>
                    <Link
                      href="/submit"
                      className={cn(
                        'text-lg font-medium transition-colors hover:text-primary py-2',
                        pathname === '/submit' ? 'text-foreground' : 'text-muted-foreground'
                      )}
                      aria-current={pathname === '/submit' ? 'page' : undefined}
                    >
                      {t('nav.submit')}
                    </Link>
                    <Link
                      href="/favorites"
                      className={cn(
                        'text-lg font-medium transition-colors hover:text-primary py-2',
                        pathname === '/favorites' ? 'text-foreground' : 'text-muted-foreground'
                      )}
                      aria-current={pathname === '/favorites' ? 'page' : undefined}
                    >
                      <Heart className="h-5 w-5 inline mr-2" aria-hidden="true" />
                      {t('nav.favorites', 'Favorites')}
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary py-2',
                      pathname === '/admin' ? 'text-foreground' : 'text-muted-foreground'
                    )}
                    aria-current={pathname === '/admin' ? 'page' : undefined}
                  >
                    {t('nav.admin')}
                  </Link>
                )}

                <div className="border-t pt-4 mt-4">
                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => logout.mutate()}
                      disabled={logout.isPending}
                      aria-label={t('nav.logout') || 'Logout'}
                    >
                      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                      {t('nav.logout')}
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        aria-label={t('nav.login') || 'Login'}
                      >
                        <User className="h-4 w-4 mr-2" aria-hidden="true" />
                        {t('nav.login')}
                      </Button>
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
