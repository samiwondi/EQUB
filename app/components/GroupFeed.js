'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { groupService } from '../services/groupService'

export default function GroupFeed() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [search, filter])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {}
      if (search) params.search = search
      if (filter !== 'all') params.privacy = filter
      
      const response = await groupService.getGroups(params)
      setGroups(response.data || [])
    } catch (err) {
      console.error('Failed to fetch groups:', err)
      setError('Failed to load groups. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestJoin = async (groupId, message) => {
    try {
      await groupService.requestJoin(groupId, { message })
      alert('Request sent! The group creator will review it.')
      fetchGroups()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request')
    }
  }

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name?.toLowerCase().includes(search.toLowerCase()) ||
                          group.description?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || group.privacy === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a84c]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Open Groups</h2>
          <p className="text-gray-400 text-sm">Join a group and start saving together</p>
        </div>
        <Link href="/groups/create">
          <button className="btn-primary text-sm">
            + Create New Group
          </button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            placeholder="🔍 Search groups..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'all' ? 'bg-[#c9a84c] text-[#0a1628] font-semibold' : 'bg-[#1a2f57] text-gray-300 hover:bg-[#23406e]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'public' ? 'bg-[#16a34a] text-white font-semibold' : 'bg-[#1a2f57] text-gray-300 hover:bg-[#23406e]'
            }`}
          >
            Public
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'private' ? 'bg-[#dc2626] text-white font-semibold' : 'bg-[#1a2f57] text-gray-300 hover:bg-[#23406e]'
            }`}
          >
            Private
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="glass-card text-center py-12">
            <p className="text-gray-400">No groups found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isMember = group.Memberships?.some(m => m.user_id === user?.id)
            const isPending = group.Memberships?.some(m => m.user_id === user?.id && m.role === 'pending')
            
            return (
              <Link href={`/groups/${group.id}`} key={group.id}>
                <div className="glass-card hover:border-[#c9a84c] transition cursor-pointer">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="text-4xl md:text-5xl flex-shrink-0">
                      {group.category === 'Family' ? '👨‍👩‍👧‍👦' :
                       group.category === 'Professional' ? '💼' :
                       group.category === 'Community' ? '🏘️' :
                       group.category === 'Women' ? '👩‍💼' :
                       group.category === 'Youth' ? '🚀' : '📌'}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <h3 className="text-xl font-semibold">{group.name}</h3>
                          <p className="text-gray-400 text-sm">{group.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${group.status === 'open' || group.status === 'active' ? 'badge-open' : 'badge-pending'}`}>
                            {group.status}
                          </span>
                          <span className="badge badge-open text-xs bg-[#1a2f57] text-gray-300">
                            {group.privacy === 'public' ? '🌐 Public' : '🔒 Private'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <span>👥</span>
                          <span>{group.member_count || 0}/{group.max_members} members</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <span>💰</span>
                          <span className="text-[#c9a84c] font-semibold">ETB {group.contribution_amount}</span>
                          <span className="text-gray-500">/{group.frequency}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <span>👤</span>
                          <span>By {group.creator?.full_name || 'Admin'}</span>
                        </div>
                      </div>

                      {group.privacy === 'public' && group.status === 'open' && (
                        <div className="mt-3">
                          {isMember ? (
                            <button disabled className="btn-secondary text-sm">✅ Member</button>
                          ) : isPending ? (
                            <button disabled className="btn-secondary text-sm">⏳ Awaiting Approval</button>
                          ) : (
                            <button 
                              className="btn-primary text-sm"
                              onClick={(e) => {
                                e.preventDefault()
                                const message = prompt('Optional: Why do you want to join this group?')
                                handleRequestJoin(group.id, message)
                              }}
                            >
                              Request to Join
                            </button>
                          )}
                        </div>
                      )}
                      {group.privacy === 'public' && group.status !== 'open' && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-500">🔒 Group is closed for new members</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}