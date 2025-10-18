'use client'

import { useTranslation } from 'react-i18next'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useMikvahs } from '@/lib/hooks/useMikvahs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingScreen } from '@/components/ui/spinner'
import { AdminMikvahCard } from '@/components/admin/AdminMikvahCard'
import { Heart, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function FavoritesPage() {
  const { t } = useTranslation()
  const { data: favorites = [], isLoading: favoritesLoading } = useFavorites()
  const { data: allMikvahs = [], isLoading: mikvahsLoading } = useMikvahs()

  const isLoading = favoritesLoading || mikvahsLoading

  // Get favorited mikvahs with full data
  const favoritedMikvahs = allMikvahs.filter(mikvah =>
    favorites.some(fav => fav.mikvah_id === mikvah.id)
  )

  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="text-3xl font-bold">{t('favorites.title', 'My Favorites')}</h1>
        </div>
        <p className="text-muted-foreground">
          {t('favorites.description', 'Your saved mikvahs for quick access')}
        </p>
      </div>

      {favoritedMikvahs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('favorites.empty.title', 'No favorites yet')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('favorites.empty.description', 'Start exploring and save your favorite mikvahs for easy access')}
            </p>
            <Button asChild>
              <Link href="/map">
                <MapPin className="h-4 w-4 mr-2" />
                Explore Mikvahs
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {favoritedMikvahs.length} {favoritedMikvahs.length === 1 ? 'favorite' : 'favorites'}
            </p>
          </div>

          {favoritedMikvahs.map((mikvah) => (
            <AdminMikvahCard
              key={mikvah.id}
              mikvah={mikvah}
              showActions="approved" // Show edit option but no delete
            />
          ))}
        </div>
      )}
    </div>
  )
}
