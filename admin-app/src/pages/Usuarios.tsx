import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus, Shield, Edit2, X } from 'lucide-react'

export function Usuarios() {
  const { isAdmin } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor'>('editor')
  const [inviting, setInviting] = useState(false)
  const [editingRole, setEditingRole] = useState<{ id: string; role: 'admin' | 'editor' } | null>(null)

  const loadProfiles = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setProfiles(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadProfiles() }, [loadProfiles])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!isAdmin) return
    setInviting(true)

    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: inviteEmail,
        password: invitePassword,
        email_confirm: true,
      })
      if (error) throw error

      await supabase.from('profiles').insert([{
        id: data.user.id,
        email: inviteEmail,
        role: inviteRole,
      }])

      setShowInvite(false)
      setInviteEmail('')
      setInvitePassword('')
      setInviteRole('editor')
      loadProfiles()
    } catch (err: unknown) {
      alert('Erro: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setInviting(false)
    }
  }

  async function handleUpdateRole(id: string, role: 'admin' | 'editor') {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) { alert('Erro ao atualizar role: ' + error.message); return }
    setEditingRole(null)
    loadProfiles()
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Shield size={40} className="mb-3" />
        <p className="text-sm">Apenas administradores podem gerenciar usuários.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <UserPlus size={16} />
          Novo usuário
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-center py-12 text-gray-500 text-sm">Nenhum usuário encontrado.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastrado em</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map(profile => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{profile.email}</td>
                  <td className="px-4 py-3">
                    {editingRole?.id === profile.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editingRole.role}
                          onChange={e => setEditingRole({ id: profile.id, role: e.target.value as 'admin' | 'editor' })}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Administrador</option>
                        </select>
                        <button onClick={() => handleUpdateRole(profile.id, editingRole.role)}
                          className="text-xs px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600">
                          Salvar
                        </button>
                        <button onClick={() => setEditingRole(null)} className="text-gray-400 hover:text-gray-600">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                        profile.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {profile.role === 'admin' ? 'Administrador' : 'Editor'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button onClick={() => setEditingRole({ id: profile.id, role: profile.role })}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Alterar perfil">
                        <Edit2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Novo Usuário */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Novo usuário</h3>
              <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha inicial</label>
                <input type="password" value={invitePassword} onChange={e => setInvitePassword(e.target.value)} required minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'admin' | 'editor')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="editor">Editor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={inviting}
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 rounded-lg">
                  {inviting ? 'Criando...' : 'Criar usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
