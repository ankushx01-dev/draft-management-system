import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  Check,
  Clock3,
  FileText,
  LayoutGrid,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

const STORAGE_KEY = 'draftly-drafts'
const EMPTY_FORM = { title: '', content: '' }

const seedDrafts = [
  {
    id: 'welcome-to-draftly',
    title: 'Welcome to Draftly',
    content: 'A simple space to capture ideas, shape your thoughts, and ship your best work.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 'weekend-reading-list',
    title: 'Weekend reading list',
    content: 'Three essays to read this weekend and a few notes on why they are worth your time.',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  },
]

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

function readDrafts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : seedDrafts
  } catch {
    return seedDrafts
  }
}

function formatDate(date) {
  const value = new Date(date)
  const now = new Date()
  const sameDay = value.toDateString() === now.toDateString()
  if (sameDay) return `Today, ${value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  return value.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function excerpt(content) {
  const clean = content.replace(/\s+/g, ' ').trim()
  return clean.length > 110 ? `${clean.slice(0, 110)}…` : clean || 'No content yet'
}

function App() {
  const [drafts, setDrafts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [activeView, setActiveView] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      await wait(450)
      setDrafts(readDrafts())
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!loading) localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
  }, [drafts, loading])

  const showNotice = (message, type = 'success') => {
    setNotice({ message, type })
    window.setTimeout(() => setNotice(null), 2800)
  }

  const selectDraft = useCallback((draft) => {
    setEditingId(draft.id)
    setForm({ title: draft.title, content: draft.content })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const startNewDraft = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setActiveView('all')
  }

  const saveDraft = async (event) => {
    event.preventDefault()
    const title = form.title.trim() || 'Untitled draft'
    const content = form.content.trim()
    if (!content) {
      showNotice('Add some content before saving your draft.', 'error')
      return
    }

    setSaving(true)
    await wait(500)
    const updatedAt = new Date().toISOString()
    if (editingId) {
      setDrafts((current) =>
        current.map((draft) => (draft.id === editingId ? { ...draft, title, content, updatedAt } : draft)),
      )
      showNotice('Draft updated successfully.')
    } else {
      setDrafts((current) => [{ id: crypto.randomUUID(), title, content, updatedAt }, ...current])
      showNotice('Draft saved successfully.')
    }
    setForm(EMPTY_FORM)
    setEditingId(null)
    setSaving(false)
  }

  const deleteDraft = async (id) => {
    setSaving(true)
    await wait(300)
    setDrafts((current) => current.filter((draft) => draft.id !== id))
    if (editingId === id) startNewDraft()
    setSaving(false)
    showNotice('Draft deleted.')
  }

  const filteredDrafts = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    return drafts
      .filter((draft) => activeView === 'all' || Date.now() - new Date(draft.updatedAt) < 86400000 * 7)
      .filter((draft) => !normalized || `${draft.title} ${draft.content}`.toLowerCase().includes(normalized))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [drafts, query, activeView])

  const recentCount = drafts.filter((draft) => Date.now() - new Date(draft.updatedAt) < 86400000 * 7).length

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>draftly</span></div>
        <div className="topbar-actions">
          <span className="saved-indicator"><span className="status-dot" /> All changes saved</span>
          <button className="avatar" aria-label="Profile">AR</button>
        </div>
      </header>

      <div className="mobile-toolbar">
        <button className="icon-button" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle menu"><Menu size={20} /></button>
        <span>{activeView === 'all' ? 'All drafts' : 'Recent drafts'}</span>
        <button className="icon-button" onClick={startNewDraft} aria-label="Create draft"><Plus size={20} /></button>
      </div>

      <div className="workspace">
        <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
          <div className="sidebar-heading">Workspace</div>
          <button className={`nav-item ${activeView === 'all' ? 'active' : ''}`} onClick={() => { setActiveView('all'); setMobileNavOpen(false) }}>
            <LayoutGrid size={18} /> All drafts <span className="count">{drafts.length}</span>
          </button>
          <button className={`nav-item ${activeView === 'recent' ? 'active' : ''}`} onClick={() => { setActiveView('recent'); setMobileNavOpen(false) }}>
            <Clock3 size={18} /> Recently edited <span className="count">{recentCount}</span>
          </button>
          <div className="sidebar-bottom">
            <div className="storage-card"><Archive size={17} /><div><strong>Local storage</strong><span>Your drafts stay private</span></div><Check size={15} className="check" /></div>
            <div className="sidebar-tip"><Sparkles size={16} /><p><strong>Keep creating.</strong><br />Great ideas start as drafts.</p></div>
          </div>
        </aside>

        <main className="main-content">
          <section className="hero">
            <div><p className="eyebrow">YOUR WORKSPACE</p><h1>All drafts <span>{drafts.length}</span></h1><p className="subtitle">Capture ideas now. Perfect them later.</p></div>
            <button className="primary-button" onClick={startNewDraft}><Plus size={18} /> New draft</button>
          </section>

          <section className="editor-card">
            <div className="card-header"><div className="card-title"><span className="document-icon"><FileText size={18} /></span><strong>{editingId ? 'Edit draft' : 'Start writing'}</strong></div>{editingId && <button className="close-edit" onClick={startNewDraft}><X size={16} /> Cancel edit</button>}</div>
            <form onSubmit={saveDraft}>
              <input className="title-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Give your draft a title..." maxLength={100} />
              <textarea className="content-input" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Start writing your thoughts here..." rows={5} />
              <div className="editor-footer"><span>{form.content.length} characters</span><button className="save-button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update draft' : 'Save as draft'} <Check size={16} /></button></div>
            </form>
          </section>

          <section className="drafts-section">
            <div className="section-header"><div><h2>{activeView === 'recent' ? 'Recently edited' : 'Your drafts'}</h2><p>{filteredDrafts.length ? `${filteredDrafts.length} ${filteredDrafts.length === 1 ? 'draft' : 'drafts'} to explore` : 'Your saved ideas will show up here'}</p></div><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search drafts..." aria-label="Search drafts" /></label></div>
            {loading ? <div className="empty-state"><div className="loader" />Loading your drafts...</div> : filteredDrafts.length === 0 ? <div className="empty-state"><FileText size={32} /><strong>{query ? 'No drafts found' : 'Nothing here yet'}</strong><span>{query ? 'Try a different search term.' : 'Start with an idea above and save it as a draft.'}</span></div> : <div className="draft-grid">{filteredDrafts.map((draft) => <article className="draft-card" key={draft.id}><div className="draft-card-top"><span className="draft-label">DRAFT</span><button className="more-button" aria-label={`Delete ${draft.title}`} onClick={() => deleteDraft(draft.id)}><Trash2 size={16} /></button></div><button className="draft-content" onClick={() => selectDraft(draft)}><h3>{draft.title}</h3><p>{excerpt(draft.content)}</p></button><div className="draft-meta"><span>{formatDate(draft.updatedAt)}</span><button className="edit-link" onClick={() => selectDraft(draft)}><Pencil size={14} /> Edit</button></div></article>)}</div>}
          </section>
        </main>
      </div>
      {notice && <div className={`toast ${notice.type}`}><span>{notice.type === 'success' ? <Check size={17} /> : <X size={17} />}</span>{notice.message}</div>}
    </div>
  )
}

export default App
