'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { groupService } from '../services/groupService'

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    fetchMyGroups()
  }, [])

  const fetchMyGroups = async () => {
    try {
      setLoading(true)
      const response = await groupService.getGroups()
      const allGroups = response.data || []
      const myGroups = allGroups.filter(group => 
        group.Memberships?.some(m => m.user_id === user?.id)
      )
      setGroups(myGroups)
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a84c]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold gradient-text">My Groups</h1>
        <Link href="/groups/create">
          <button className="btn-primary">+ Create Group</button>
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="glass-card text-center py-12">
          <p className="text-gray-400">You haven't joined any groups yet</p>
          <Link href="/dashboard">
            <button className="btn-primary mt-4">Browse Groups</button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {groups.map(group => (
            <Link href={`/groups/${group.id}`} key={group.id}>
              <div className="glass-card hover:border-[#c9a84c] transition cursor-pointer">
                <h3 className="text-xl font-semibold">{group.name}</h3>
                <p className="text-gray-400 text-sm">👥 {group.member_count || 0} members</p>
                <p className="text-[#c9a84c] font-bold">ETB {group.contribution_amount}</p>
                <span className={`badge ${group.status === 'open' || group.status === 'active' ? 'badge-open' : 'badge-pending'}`}>
                  {group.status || 'Active'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}