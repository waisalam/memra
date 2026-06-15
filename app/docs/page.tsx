import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import DocsContent from './docs-content'

export const metadata = {
  title: 'Docs — Memra',
  description: 'API reference and SDK documentation for Memra persistent AI memory.',
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#000] text-zinc-100">
      <SiteNavbar />
      <DocsContent />
      <SiteFooter />
    </div>
  )
}
