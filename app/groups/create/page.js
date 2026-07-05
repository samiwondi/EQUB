'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateGroupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    frequency: 'monthly',
    maxMembers: '',
    startDate: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Group created successfully! (Backend coming soon)')
    router.push('/groups')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold gradient-text mb-8">Create New Equb Group</h1>
      
      <form onSubmit={handleSubmit} className="glass-card space-y-6">
        <div>
          <label className="block text-gray-300 mb-2 text-sm">Group Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Family Savings Group"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-field"
            rows="3"
            placeholder="Describe the purpose of this equb group..."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Contribution Amount (ETB) *</label>
            <input
              type="number"
              name="contributionAmount"
              value={form.contributionAmount}
              onChange={handleChange}
              className="input-field"
              placeholder="1000"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Frequency *</label>
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Max Members *</label>
            <input
              type="number"
              name="maxMembers"
              value={form.maxMembers}
              onChange={handleChange}
              className="input-field"
              placeholder="10"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="btn-primary flex-1">
            Create Group
          </button>
          <button 
            type="button" 
            onClick={() => router.push('/groups')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}