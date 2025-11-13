'use client'
import { signIn } from "next-auth/react"
export default function Login(){
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-2xl border border-white/10 bg-hyp-card p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold">Hypasus Management Tool — Verwenboxen.nl</h1>
        <p className="mt-3 text-white/70">Log in met een toegestane e-mail om het dashboard te openen.</p>
        <button onClick={()=>signIn('google')} className="mt-6 rounded-xl px-6 py-3 bg-hyp-primary/90 hover:bg-hyp-primary text-black font-semibold shadow-glow transition w-full">
          Log in met Google
        </button>
      </div>
    </div>
  )
}
