'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  if (!user) return null

  return (
    <div className="glass-card sticky top-20">
      {/* User Profile Card */}
      <div className="text-center border-b border-[#1a2f57] pb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#c9a84c] to-[#a8893a] flex items-center justify-center text-2xl font-bold text-[#0a1628] mx-auto mb-3">
          {user.full_name?.charAt(0) || 'U'}
        </div>
        <h3 className="font-semibold">{user.full_name}</h3>
        <p className="text-xs text-gray-400">{user.email}</p>
        <div className="flex justify-center gap-2 mt-2">
          <span className="badge badge-open text-xs">Member</span>
          <span className="text-xs text-gray-400">• {user.role}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="py-4 border-b border-[#1a2f57]">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-lg font-bold gradient-text">{user.groupsJoined || 0}</p>
            <p className="text-xs text-gray-400">Groups</p>
          </div>
          <div>
            <p className="text-lg font-bold gradient-text">{user.totalSaved || 'ETB 0'}</p>
            <p className="text-xs text-gray-400">Total Saved</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 space-y-2">
        <button 
          className="btn-primary w-full text-sm"
          onClick={() => router.push('/groups/create')}
        >
          + Create Group
        </button>
        <button className="btn-secondary w-full text-sm">
          🔍 Find Groups
        </button>
      </div>

      {/* Member Since */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Member since {user.joinDate || 'Dec 2024'}
      </p>
    </div>
  )
}