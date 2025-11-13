'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { MapPin, LogOut, User, Globe, Menu, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/map"
          className="flex items-center gap-2.5 font-bold text-lg transition-all duration-300 hover:text-primary group"
          aria-label={t('nav.home') || 'Home - Mikvah Locator'}
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="hidden sm:inline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('map.title')}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            href="/map"
            className={cn(
              'px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-primary/10',
              pathname === '/map'
                ? 'text-primary bg-primary/10 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
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
                  'px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-primary/10',
                  pathname === '/submit'
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={pathname === '/submit' ? 'page' : undefined}
              >
                {t('nav.submit')}
              </Link>
              <Link
                href="/favorites"
                className={cn(
                  'px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-primary/10 flex items-center gap-1.5',
                  pathname === '/favorites'
                    ? 'text-primary bg-primary/10 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={pathname === '/favorites' ? 'page' : undefined}
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                {t('nav.favorites', 'Favorites')}
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-primary/10',
                pathname === '/admin'
                  ? 'text-primary bg-primary/10 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={pathname === '/admin' ? 'page' : undefined}
            >
              {t('nav.admin')}
            </Link>
          )}

          <div className="h-5 w-px bg-border/60 mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                aria-label={`Switch to ${i18n.language === 'en' ? 'Hebrew' : 'English'}`}
                className="gap-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-300"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                <span className="font-semibold text-xs uppercase">
                  {i18n.language === 'en' ? 'EN' : 'HE'}
                </span>
                <span className="sr-only">Current language: {i18n.language === 'en' ? 'English' : 'Hebrew'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{i18n.language === 'en' ? 'Switch to Hebrew (עברית)' : 'Switch to English'}</p>
            </TooltipContent>
          </Tooltip>

          <ThemeToggle size="sm" />

          {user ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  aria-label={t('nav.logout') || 'Logout'}
                  className="hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-300"
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
                    className="hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-300 hover:shadow-sm"
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
                    className="min-h-[44px] min-w-[44px]"
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
                size="sm"
                onClick={toggleLanguage}
                aria-label={`Switch to ${i18n.language === 'en' ? 'Hebrew' : 'English'}`}
                className="gap-2 min-h-[44px] px-3"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                <span className="font-semibold text-xs uppercase">
                  {i18n.language === 'en' ? 'EN' : 'HE'}
                </span>
                <span className="sr-only">Current language: {i18n.language === 'en' ? 'English' : 'Hebrew'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{i18n.language === 'en' ? 'Switch to Hebrew (עברית)' : 'Switch to English'}</p>
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
                        className="min-h-[44px] min-w-[44px]"
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
            <SheetContent side="right" className="w-full sm:w-80">
              <SheetHeader className="pb-4">
                <SheetTitle className="text-left">{t('map.title')}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-4" role="navigation" aria-label="Main navigation">
                <Link
                  href="/map"
                  className={cn(
                    'text-lg font-medium transition-colors hover:text-primary py-3 px-2 rounded-md min-h-[44px] flex items-center',
                    pathname === '/map' ? 'text-foreground bg-muted' : 'text-muted-foreground hover:bg-muted/50'
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
                        'text-lg font-medium transition-colors hover:text-primary py-3 px-2 rounded-md min-h-[44px] flex items-center',
                        pathname === '/submit' ? 'text-foreground bg-muted' : 'text-muted-foreground hover:bg-muted/50'
                      )}
                      aria-current={pathname === '/submit' ? 'page' : undefined}
                    >
                      {t('nav.submit')}
                    </Link>
                    <Link
                      href="/favorites"
                      className={cn(
                        'text-lg font-medium transition-colors hover:text-primary py-3 px-2 rounded-md min-h-[44px] flex items-center',
                        pathname === '/favorites' ? 'text-foreground bg-muted' : 'text-muted-foreground hover:bg-muted/50'
                      )}
                      aria-current={pathname === '/favorites' ? 'page' : undefined}
                    >
                      <Heart className="h-5 w-5 mr-3" aria-hidden="true" />
                      {t('nav.favorites', 'Favorites')}
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary py-3 px-2 rounded-md min-h-[44px] flex items-center',
                      pathname === '/admin' ? 'text-foreground bg-muted' : 'text-muted-foreground hover:bg-muted/50'
                    )}
                    aria-current={pathname === '/admin' ? 'page' : undefined}
                  >
                    {t('nav.admin')}
                  </Link>
                )}

                <div className="border-t pt-4 mt-4 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-muted-foreground">Theme</span>
                    <ThemeToggle showLabel={true} size="sm" />
                  </div>
                  
                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start min-h-[44px]"
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
                        className="w-full justify-start min-h-[44px]"
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
