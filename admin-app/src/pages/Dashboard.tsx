import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Newspaper, Users, Clock } from 'lucide-react'

type Stats = {
  totalPosts: number
  lastPost: string | null
  totalUsers: number
}

export function Dashboard() {
  const { profile, isAdmin } = useAuth()
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, lastPost: null, totalUsers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [postsRes, usersRes] = await Promise.all([
        supabase.from('posts').select('created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(1),
        isAdmin ? supabase.from('profiles').select('*', { count: 'exact' }).limit(1) : Promise.resolve({ count: null }),
      ])
      setStats({
        totalPosts: postsRes.count ?? 0,
        lastPost: postsRes.data?.[0]?.created_at ?? null,
        totalUsers: (usersRes as { count: number | null }).count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [isAdmin])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {greeting()}{profile?.email ? `, ${profile.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Bem-vindo ao painel administrativo Portela & Oliveira.</p>
      </div>

      {loading ? (
        <div className="flex gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Newspaper size={18} className="text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Total de notícias</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Clock size={18} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Última publicação</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {stats.lastPost
                ? new Date(stats.lastPost).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'Nenhuma ainda'}
            </p>
          </div>

          {isAdmin && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <Users size={18} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Usuários</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
