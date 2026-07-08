'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { groupService } from '../../services/groupService'

export default function CreateGroupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    privacy: 'public',
    contribution_amount: '',
    frequency: 'monthly',
    max_members: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await groupService.createGroup({
        ...form,
        contribution_amount: parseFloat(form.contribution_amount),
        max_members: parseInt(form.max_members),
      })

      alert('Group created successfully!')
      router.push(`/groups/${response.data.group.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold gradient-text mb-8">Create New Equb Group</h1>
      
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

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

        <div>
          <label className="block text-gray-300 mb-2 text-sm">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select Category</option>
            <option value="Family">Family</option>
            <option value="Professional">Professional</option>
            <option value="Community">Community</option>
            <option value="Women">Women</option>
            <option value="Youth">Youth</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Contribution Amount (ETB) *</label>
            <input
              type="number"
              name="contribution_amount"
              value={form.contribution_amount}
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
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm">Max Members *</label>
          <input
            type="number"
            name="max_members"
            value={form.max_members}
            onChange={handleChange}
            className="input-field"
            placeholder="10"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm">Privacy</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={form.privacy === 'public'}
                onChange={handleChange}
                className="w-4 h-4 text-[#c9a84c]"
              />
              <span>Public (anyone can request to join)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={form.privacy === 'private'}
                onChange={handleChange}
                className="w-4 h-4 text-[#c9a84c]"
              />
              <span>Private (invite only)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
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