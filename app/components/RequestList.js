'use client'

import { useState, useEffect } from 'react'
import { groupService } from '../services/groupService'

export default function RequestList({ groupId, isCreator, onUpdate }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    if (isCreator) {
      fetchRequests()
    }
  }, [groupId, isCreator])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await groupService.getPendingRequests(groupId)
      setRequests(res.data || [])
    } catch (error) {
      console.error('Failed to fetch requests:', error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      setProcessing(userId)
      await groupService.approveRequest(groupId, userId)
      onUpdate?.()
      await fetchRequests()
    } catch (error) {
      alert('Failed to approve request. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  const handleDeny = async (userId) => {
    try {
      setProcessing(userId)
      await groupService.denyRequest(groupId, userId)
      onUpdate?.()
      await fetchRequests()
    } catch (error) {
      alert('Failed to deny request. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  if (!isCreator) return null

  return (
    <div className="glass-card mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Pending Join Requests</h3>
        <span className="bg-[#c9a84c] text-[#0a1628] text-xs font-semibold px-3 py-1 rounded-full">
          {requests.length}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#c9a84c]"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">🎉 No pending requests</p>
          <p className="text-gray-500 text-xs">All join requests have been processed</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {requests.map((req) => {
            // Get user data from the nested User object
            const user = req.User || {}
            const userId = req.user_id || user.id
            const fullName = user.full_name || 'Unknown User'
            const email = user.email || 'No email'

            return (
              <div 
                key={req.id || userId} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-[#0a1628] rounded-lg border border-[#1a2f57] hover:border-[#2c5085] transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#23406e] to-[#2c5085] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {fullName.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{fullName}</p>
                      <p className="text-xs text-gray-400">{email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleApprove(userId)}
                    disabled={processing === userId}
                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    {processing === userId ? 'Processing...' : '✅ Approve'}
                  </button>
                  <button
                    onClick={() => handleDeny(userId)}
                    disabled={processing === userId}
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    {processing === userId ? '...' : '❌ Deny'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}