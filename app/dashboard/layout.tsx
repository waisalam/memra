import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Sidebar
        userName={session.user.name}
        userEmail={session.user.email}
        userImage={session.user.image}
        plan={session.user.plan}
      />
      {/* lg:ml-60 matches sidebar width; on mobile no margin, top padding clears the hamburger */}
      <main className="lg:ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
