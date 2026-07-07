'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
      else setUser(null)
    }
    checkUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="bg-[#122240] border-b border-[#1a2f57] px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <span className="text-2xl font-bold gradient-text">እቁብ</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-300 hidden md:block">
                👋 {user.full_name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            // Show nothing when logged out
            <span className="text-sm text-gray-500">Welcome</span>
          )}
        </div>
      </div>
    </nav>
  )
}