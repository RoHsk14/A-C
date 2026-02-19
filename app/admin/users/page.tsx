import { getUsers } from '../actions'
import { UsersTable } from '@/components/admin/users-table'
import { Users, UserPlus, UserCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string; role?: string }
}) {
    const page = parseInt(searchParams.page || '1')
    const search = searchParams.search
    const roleFilter = searchParams.role

    const { users, total, pages } = await getUsers(page, 20, search, roleFilter)

    // Calculate stats
    const admins = users.filter(u => u.role === 'admin').length
    const creators = users.filter(u => u.role === 'creator').length
    const members = users.filter(u => u.role === 'member').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Gestion des Utilisateurs
                </h1>
                <p className="text-slate-500 mt-1">
                    Rechercher, filtrer et gérer les utilisateurs de la plateforme
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 rounded-2xl shadow-sm border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Users className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Total</p>
                            <p className="text-2xl font-bold text-slate-900">{total}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 rounded-2xl shadow-sm border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Creators</p>
                            <p className="text-2xl font-bold text-slate-900">{creators}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 rounded-2xl shadow-sm border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-cyan-50 flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-cyan-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Admins</p>
                            <p className="text-2xl font-bold text-slate-900">{admins}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Users Table */}
            <UsersTable
                initialUsers={users}
                initialTotal={total}
                initialPage={page}
            />
        </div>
    )
}
