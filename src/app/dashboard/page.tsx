import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'COLPORTOR') {
    if (user.role === 'ADMIN') redirect('/admin')
    redirect('/lider')
  }

  return <DashboardClient user={user} />
}
