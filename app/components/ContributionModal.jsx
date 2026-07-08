'use client'

import { useState } from 'react'
import { groupService } from '../services/groupService'

export default function ContributionModal({ groupId, contributionAmount, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Send the fixed amount (backend will also enforce this)
      await groupService.contribute(groupId, {
        amount: contributionAmount,
        payment_method: paymentMethod,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit contribution')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>
        <h2 className="text-2xl font-bold gradient-text mb-4">Make Contribution</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Amount (ETB) – Fixed</label>
            <div className="w-full p-3 bg-[#0a1628] border border-[#23406e] rounded-lg text-white text-lg font-semibold">
              ETB {contributionAmount}
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input-field"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="mobile">Mobile Money</option>
            </select>
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Contribution'}
          </button>
        </form>
      </div>
    </div>
  )
}