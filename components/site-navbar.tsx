import { auth } from '@/auth'
import SiteNavbarShell from './site-navbar-shell'

export default async function SiteNavbar() {
  const session = await auth()
  return (
    <SiteNavbarShell
      isLoggedIn={!!session?.user}
      user={session?.user ?? null}
    />
  )
}
