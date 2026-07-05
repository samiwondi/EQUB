'use client'

import Link from 'next/link'

export default function GroupsPage() {
  const groups = [
    { id: 1, name: 'Family Savings Circle', members: 8, contribution: 1000, status: 'active' },
    { id: 2, name: 'Workplace Growth Fund', members: 12, contribution: 500, status: 'active' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold gradient-text mb-8">My Groups</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {groups.map(group => (
          <Link href={`/groups/${group.id}`} key={group.id}>
            <div className="glass-card hover:border-[#c9a84c] transition cursor-pointer">
              <h3 className="text-xl font-semibold">{group.name}</h3>
              <p className="text-gray-400 text-sm">👥 {group.members} members</p>
              <p className="text-[#c9a84c] font-bold">ETB {group.contribution}</p>
              <span className="badge badge-open">Active</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}