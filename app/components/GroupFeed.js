'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GroupFeed() {
  const [groups] = useState([
    {
      id: 1,
      name: 'Family Savings Circle',
      description: 'Monthly savings for family members to support each other',
      members: 8,
      maxMembers: 10,
      contribution: 1000,
      frequency: 'Monthly',
      category: 'Family',
      status: 'open',
      createdBy: 'Abebe',
      createdAt: 'Nov 1, 2024',
      image: '👨‍👩‍👧‍👦',
      nextPayout: 'Dec 25, 2024'
    },
    {
      id: 2,
      name: 'Workplace Growth Fund',
      description: 'Colleagues saving together for professional development',
      members: 12,
      maxMembers: 15,
      contribution: 500,
      frequency: 'Weekly',
      category: 'Professional',
      status: 'open',
      createdBy: 'Kebede',
      createdAt: 'Oct 15, 2024',
      image: '💼',
      nextPayout: 'Jan 15, 2025'
    },
    {
      id: 3,
      name: 'Neighborhood United',
      description: 'Community savings for neighborhood improvements',
      members: 15,
      maxMembers: 20,
      contribution: 2000,
      frequency: 'Monthly',
      category: 'Community',
      status: 'full',
      createdBy: 'Tigist',
      createdAt: 'Sep 1, 2024',
      image: '🏘️',
      nextPayout: 'Feb 1, 2025'
    },
    {
      id: 4,
      name: "Women's Empowerment Group",
      description: 'Supporting women entrepreneurs through savings',
      members: 6,
      maxMembers: 8,
      contribution: 300,
      frequency: 'Bi-weekly',
      category: 'Women',
      status: 'open',
      createdBy: 'Meron',
      createdAt: 'Nov 20, 2024',
      image: '👩‍💼',
      nextPayout: 'Dec 30, 2024'
    },
    {
      id: 5,
      name: 'Youth Innovation Fund',
      description: 'Young professionals saving for startup ideas',
      members: 4,
      maxMembers: 6,
      contribution: 1500,
      frequency: 'Monthly',
      category: 'Youth',
      status: 'pending',
      createdBy: 'Yohannes',
      createdAt: 'Dec 1, 2024',
      image: '🚀',
      nextPayout: 'Mar 1, 2025'
    },
  ])

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(search.toLowerCase()) ||
                          group.description.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || group.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Search & Filter */}
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
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'open' ? 'bg-[#16a34a] text-white font-semibold' : 'bg-[#1a2f57] text-gray-300 hover:bg-[#23406e]'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('full')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'full' ? 'bg-[#dc2626] text-white font-semibold' : 'bg-[#1a2f57] text-gray-300 hover:bg-[#23406e]'
            }`}
          >
            Full
          </button>
        </div>
      </div>

      {/* Groups Feed */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="glass-card text-center py-12">
            <p className="text-gray-400">No groups found</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <Link href={`/groups/${group.id}`} key={group.id}>
              <div className="glass-card hover:border-[#c9a84c] transition cursor-pointer">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Group Icon */}
                  <div className="text-4xl md:text-5xl flex-shrink-0">
                    {group.image}
                  </div>

                  {/* Group Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div>
                        <h3 className="text-xl font-semibold">{group.name}</h3>
                        <p className="text-gray-400 text-sm">{group.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${group.status === 'open' ? 'badge-open' : group.status === 'full' ? 'badge-full' : 'badge-pending'}`}>
                          {group.status}
                        </span>
                        <span className="badge badge-open text-xs bg-[#1a2f57] text-gray-300">
                          {group.category}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <span>👥</span>
                        <span>{group.members}/{group.maxMembers} members</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <span>💰</span>
                        <span className="text-[#c9a84c] font-semibold">ETB {group.contribution}</span>
                        <span className="text-gray-500">/{group.frequency}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <span>📅</span>
                        <span>Next: {group.nextPayout}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <span>👤</span>
                        <span>By {group.createdBy}</span>
                      </div>
                    </div>

                    {/* Join Button */}
                    {group.status === 'open' && (
                      <div className="mt-3">
                        <button 
                          className="btn-primary text-sm"
                          onClick={(e) => {
                            e.preventDefault()
                            alert(`Joining ${group.name}... (Backend coming soon!)`)
                          }}
                        >
                          + Join Group
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}