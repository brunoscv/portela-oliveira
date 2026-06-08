import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Post } from '../lib/supabase'
import { RichEditor } from '../components/RichEditor'
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react'

const ITEMS_PER_PAGE = 10

type FormState = {
  title: string
  content: string
  imageFile: File | null
  imagePreview: string
}

const emptyForm: FormState = { title: '', content: '', imageFile: null, imagePreview: '' }

export function Noticias() {
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  const loadPosts = useCallback(async () => {
    setLoading(true)
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) query = query.ilike('title', `%${search}%`)

    const { data, count, error } = await query
    if (!error) {
      setPosts(data ?? [])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [page, search])

  useEffect(() => { loadPosts() }, [loadPosts])

  function openCreate() {
    setEditingPost(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(post: Post) {
    setEditingPost(post)
    setForm({ title: post.title, content: post.content, imageFile: null, imagePreview: post.image_url ?? '' })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingPost(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      let imageUrl = editingPost?.image_url ?? null

      if (form.imageFile) {
        const fileName = `${Date.now()}-${form.imageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`
        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, form.imageFile)
        if (uploadError) throw uploadError
        imageUrl = supabase.storage.from('blog-images').getPublicUrl(fileName).data.publicUrl
      }

      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update({ title: form.title, content: form.content, image_url: imageUrl })
          .eq('id', editingPost.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([{ title: form.title, content: form.content, image_url: imageUrl }])
        if (error) throw error
      }

      closeForm()
      loadPosts()
    } catch (err: unknown) {
      alert('Erro: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) { alert('Erro ao deletar: ' + error.message); return }
    setDeleteConfirm(null)
    loadPosts()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Notícias</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nova notícia
        </button>
      </div>

      {/* Busca */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Buscar por título..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          <Search size={16} />
          Buscar
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
            className="px-3 py-2 text-gray-500 hover:text-gray-700">
            <X size={16} />
          </button>
        )}
      </form>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center py-12 text-gray-500 text-sm">Nenhuma notícia encontrada.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {post.image_url && (
                        <img src={post.image_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(post.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(post)}
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Editar">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirm(post.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Deletar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
            Anterior
          </button>
          <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
            Próxima
          </button>
        </div>
      )}

      {/* Modal de Confirmação de Delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-gray-600 mb-6">Esta ação não pode ser desfeita. Tem certeza que deseja excluir esta notícia?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar/Editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl my-8 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingPost ? 'Editar notícia' : 'Nova notícia'}
              </h2>
              <button onClick={closeForm} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Título da notícia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem de Capa {editingPost && <span className="text-gray-400">(deixe vazio para manter a atual)</span>}
                </label>
                {form.imagePreview && (
                  <img src={form.imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  required={!editingPost}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) setForm(f => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file) }))
                  }}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <RichEditor
                  content={form.content}
                  onChange={html => setForm(f => ({ ...f, content: html }))}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 rounded-lg transition-colors">
                  {submitting ? 'Salvando...' : editingPost ? 'Salvar alterações' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
