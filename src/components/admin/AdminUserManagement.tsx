import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCog } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface AdminUserManagementProps {
  users: Array<{
    id: string
    email: string
    created_at: string
    role: string
  }>
  onToggleRole?: (userId: string, currentRole: string) => void
}

export function AdminUserManagement({ users, onToggleRole }: AdminUserManagementProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.manageUsers')}</CardTitle>
        <CardDescription>Manage user roles and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.role === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {user.role}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleRole?.(user.id, user.role)}
                  aria-label={`Toggle role for ${user.email} from ${user.role}`}
                >
                  <UserCog className="h-4 w-4 mr-1" aria-hidden="true" />
                  {user.role === 'admin' ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
