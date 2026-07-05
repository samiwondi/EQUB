'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = params.id

  const group = {
    id: groupId,
    name: 'Family Savings Circle',
    description: 'Monthly savings for family members to support each other',
    members: 8,
    maxMembers: 10,
    contribution: 1000,
    frequency: 'Monthly',
    totalSaved: 8000,
    nextPayout: 'Dec 25, 2024',
    status: 'active',
    createdBy: 'Abebe',
    createdAt: 'Nov 1, 2024',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/groups" className="text-gray-400 hover:text-white text-sm inline-block mb-4">
        ← Back to Groups
      </Link>

      <div className="glass-card">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <p className="text-gray-400 mt-2">{group.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-gray-400 text-sm">Members</p>
            <p className="text-xl font-bold">{group.members}/{group.maxMembers}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Contribution</p>
            <p className="text-xl font-bold text-[#c9a84c]">ETB {group.contribution}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Saved</p>
            <p className="text-xl font-bold text-[#c9a84c]">ETB {group.totalSaved}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Next Payout</p>
            <p className="text-xl font-bold">{group.nextPayout}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-[#1a2f57]">
          <span className={`badge badge-open`}>Active</span>
          <span className="ml-2 text-gray-400 text-sm">Created by {group.createdBy}</span>
        </div>
      </div>
    </div>
  )
}