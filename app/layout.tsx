import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title:'Hypasus Management Tool - Verwenboxen.nl', description:'Lead management dashboard' }
export default function RootLayout({ children }:{children:React.ReactNode}){
  return (<html lang="nl" className="dark"><body className="bg-hyp-bg antialiased">{children}</body></html>)
}
