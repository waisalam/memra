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
      <main className="ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
