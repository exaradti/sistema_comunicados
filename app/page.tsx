import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const has_session = (await cookies()).get('admin_session')?.value
  redirect(has_session ? '/dashboard' : '/login')
}
