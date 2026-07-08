'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '../components/Sidebar'
import GroupFeed from '../components/GroupFeed'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    } else {
      router.push('/')
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a84c]"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to እቁብ</h2>
          <p className="text-gray-400 mb-4">Please login or register to continue</p>
          <a href="/">
            <button className="btn-primary w-full">Go to Homepage</button>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="hidden md:block">
          <div className="glass-card">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-300">Quick Links</p>
              <div className="space-y-1">
                <a href="/dashboard" className="block text-sm text-gray-400 hover:text-[#c9a84c] transition">🏠 Home</a>
                <a href="/groups" className="block text-sm text-gray-400 hover:text-[#c9a84c] transition">👥 My Groups</a>
                <a href="/groups/create" className="block text-sm text-gray-400 hover:text-[#c9a84c] transition">➕ Create Group</a>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <GroupFeed />
        </div>

        <div className="md:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  )
}