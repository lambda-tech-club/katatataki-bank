import Link from "next/link"
import 'bootstrap/dist/css/bootstrap.min.css'

export const dynamic = 'force-dynamic'

export default async function Home() {

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center">
      <Link href="/create" className="btn btn-primary btn-lg mb-3">
        発行
      </Link>
      <Link href="/update" className="btn btn-primary btn-lg mb-3">
        検証
      </Link>
    </main>
  )
}
