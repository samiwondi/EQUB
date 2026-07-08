'use client'

import { useState } from 'react'
import { groupService } from '../services/groupService'

export default function InviteModal({ groupId, onClose, onInvite }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      await groupService.inviteUser(groupId, email)
      setSuccess(true)
      onInvite?.()
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invite. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-card max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-xl"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold gradient-text">Invite Member</h2>
          <p className="text-gray-400 text-sm mt-1">
            Send an invitation to join this group
          </p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-semibold text-green-400">Invitation Sent!</h3>
            <p className="text-gray-400 text-sm mt-2">
              An invite has been sent to <strong>{email}</strong>
            </p>
            <p className="text-gray-500 text-xs mt-4">Closing in a moment...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="friend@email.com"
                required
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                The user will receive an invite link via email
              </p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-[#0a1628]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Invite'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              The invite will expire in 7 days
            </p>
          </form>
        )}
      </div>
    </div>
  )
}