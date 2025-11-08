'use client'
import useSWR from 'swr'
import { useState } from 'react'
import { motion } from 'framer-motion'

const fetcher = (u: string) => fetch(u).then(r => r.json())

export default function Dashboard() {
  const [isUpdating, setIsUpdating] = useState(false)

  const { data, mutate, isLoading } = useSWR('/api/leads/list', fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
    revalidateIfStale: true,
    dedupingInterval: 1000,
  })

  const [status, setStatus] = useState('ALL')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<any>(null)

  const leads = (data?.leads || [])
    .filter((l: any) => status === 'ALL' || l.status === status)
    .filter((l: any) =>
      (l.name + l.phone + l.problem + l.extra)
        .toLowerCase()
        .includes(q.toLowerCase())
    )

  async function toggleStatus(l: any) {
    setIsUpdating(true)
    const newStatus = l.status === 'Gesloten' ? 'A' : 'Gesloten'

    // 1) Optimistische, lokale update (instant feedback)
    const optimistic = (data?.leads || []).map((lead: any) =>
      lead.id === l.id ? { ...lead, status: newStatus } : lead
    )
    mutate({ leads: optimistic }, false)

    try {
      // 2) Schrijf naar backend/Sheets
      await fetch('/api/leads/updateStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: l.id, status: newStatus }),
      })

      // 3) Korte buffer zodat Sheets sync klaar is
      await new Promise(r => setTimeout(r, 1200))

      // 4) Atomische verversing: vervang store met vers opgehaalde serverdata
      await mutate(async () => {
        const fresh = await fetch('/api/leads/list').then(r => r.json())
        return fresh
      }, false)
    } catch (e) {
      console.error(e)
      // optioneel: rollback (als je wil)
      // await mutate()
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur bg-hyp-bg/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Hypasus — Lead management</h1>
          <a href="/api/auth/signout" className="text-sm underline/20 hover:underline">
            Log uit
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-3">
          <input
            className="md:col-span-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-hyp-primary/60"
            placeholder="Zoek..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-hyp-primary/60"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="ALL">Alle statussen</option>
            {['A', 'B', 'C', 'D', 'E', 'F', 'Gesloten'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() =>
              setSelected({
                id: 'NEW',
                name: '',
                phone: '',
                problem: '',
                extra: '',
                status: 'A',
              })
            }
            className="rounded-xl px-4 py-3 bg-hyp-primary/90 hover:bg-hyp-primary text-black font-semibold transition shadow-glow"
          >
            Nieuwe lead
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-3">Datum/Tijd</th>
                <th className="text-left p-3">Naam</th>
                <th className="text-left p-3">Tel</th>
                <th className="text-left p-3">Probleem</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Acties</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td className="p-4" colSpan={6}>Laden…</td></tr>
              )}
              {leads.map((l: any) => (
                <tr
                  key={l.id}
                  className={`border-t border-white/10 hover:bg-white/[0.03] transition ${
                    l.status === 'Gesloten'
                      ? 'bg-red-500/5'
                      : l.status === 'A'
                      ? 'bg-green-500/5'
                      : ''
                  }`}
                >
                  <td className="p-3">{l.datetime}</td>
                  <td className="p-3">{l.name}</td>
                  <td className="p-3">{l.phone}</td>
                  <td className="p-3">{l.problem}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-lg px-2 py-1 font-semibold ${
                        l.status === 'Gesloten'
                          ? 'bg-red-500/20 text-red-400'
                          : l.status === 'A'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="underline/20 hover:underline mr-3" onClick={() => setSelected(l)}>
                      Open
                    </button>
                    <button className="underline/20 hover:underline" onClick={() => toggleStatus(l)}>
                      {l.status === 'Gesloten' ? 'Heropen' : 'Sluit'}
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && leads.length === 0 && (
                <tr><td className="p-4" colSpan={6}>Geen leads gevonden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <LeadModal
          lead={selected}
          onClose={() => setSelected(null)}
          onChanged={() => { setSelected(null); mutate(); }}
        />
      )}
    </main>
  )
}

function LeadModal({ lead, onClose, onChanged }: { lead: any, onClose: () => void, onChanged: () => void }) {
  const isNew = lead.id === 'NEW'
  const [form, setForm] = useState({ ...lead })
  const { data } = useSWR(!isNew ? `/api/leads/notes?id=${lead.id}` : null, u => fetch(u).then(r => r.json()))

  return (
    <div className="fixed inset-0 z-20 flex items-end md:items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-hyp-card p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">✕</button>
        <h3 className="text-xl font-semibold">{isNew ? 'Nieuwe lead' : `Lead #${lead.id}`}</h3>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <input className="rounded-xl bg-white/5 border border-white/10 px-3 py-2" placeholder="Naam" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="rounded-xl bg-white/5 border border-white/10 px-3 py-2" placeholder="Telefoon" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input className="rounded-xl bg-white/5 border border-white/10 px-3 py-2" placeholder="Probleem" value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} />
          <input className="rounded-xl bg-white/5 border border-white/10 px-3 py-2" placeholder="Extra info" value={form.extra} onChange={e => setForm({ ...form, extra: e.target.value })} />
          <select className="rounded-xl bg-white/5 border border-white/10 px-3 py-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            {['A', 'B', 'C', 'D', 'E', 'F', 'Gesloten'].map((s: string) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            className="rounded-xl px-4 py-2 bg-hyp-primary/90 hover:bg-hyp-primary text-black font-semibold shadow-glow"
            onClick={async () => {
              const url = isNew ? '/api/leads/create' : '/api/leads/update'
              await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
              onChanged()
            }}
          >
            {isNew ? 'Aanmaken' : 'Opslaan'}
          </button>

          {!isNew && (
            <button
              className="rounded-xl px-4 py-2 border border-white/15 hover:bg-white/10"
              onClick={async () => {
                await fetch('/api/leads/updateStatus', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: lead.id,
                    status: form.status === 'Gesloten' ? 'A' : 'Gesloten',
                  }),
                })
                await new Promise(r => setTimeout(r, 1200))
                onChanged()
              }}
            >
              {form.status === 'Gesloten' ? 'Heropen' : 'Sluit'}
            </button>
          )}
        </div>

        {!isNew && <Notes leadId={lead.id} />}
      </motion.div>
    </div>
  )
}

function Notes({ leadId }: { leadId: string }) {
  const { data, mutate } = useSWR(`/api/leads/notes?id=${leadId}`, u => fetch(u).then(r => r.json()))
  const [note, setNote] = useState('')
  return (
    <div className="mt-6">
      <h4 className="font-semibold">Notities</h4>
      <div className="mt-2 space-y-2 max-h-56 overflow-auto pr-1">
        {(data?.notes || []).map((n: any, i: number) => (
          <div key={i} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
            <div className="text-xs text-white/60">{n.author} • {n.timestamp}</div>
            <div className="mt-1 text-sm">{n.note}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Schrijf een notitie..." className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2" />
        <button
          className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10"
          onClick={async () => {
            if (!note.trim()) return
            await fetch('/api/leads/notes/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: leadId, note }) })
            setNote('')
            mutate()
          }}
        >
          Plaats
        </button>
      </div>
    </div>
  )
}
