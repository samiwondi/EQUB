'use client'

import { useState, useEffect } from 'react'
import { groupService } from '../services/groupService'

export default function CycleStatus({ groupId, isCreator }) {
  const [cycle, setCycle] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCycleStatus()
  }, [groupId])

  const fetchCycleStatus = async () => {
    try {
      setLoading(true)
      const res = await groupService.getCycleStatus(groupId)
      setCycle(res.data.cycle)
      setMembers(res.data.members || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cycle status')
    } finally {
      setLoading(false)
    }
  }

  const handleDraw = async () => {
    if (!confirm('Draw a winner for this round?')) return
    try {
      await groupService.drawWinner(groupId)
      alert('Winner drawn!')
      fetchCycleStatus()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to draw winner')
    }
  }

  const handleEndCycle = async (action) => {
    const msg = action === 'reform' ? 'Reform the group for a new cycle?' : 'Dismantle the group?'
    if (!confirm(msg)) return
    try {
      await groupService.endCycle(groupId, action)
      alert(`Cycle ${action === 'reform' ? 'reformed' : 'dismantled'} successfully`)
      fetchCycleStatus()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end cycle')
    }
  }

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading cycle status...</div>
  }

  if (!cycle) {
    return (
      <div className="glass-card mt-6">
        <p className="text-gray-400 text-sm">No active cycle. Start one to begin!</p>
        {isCreator && (
          <button 
            onClick={async () => {
              const date = prompt('Start date (YYYY-MM-DD):', new Date().toISOString().split('T')[0])
              if (date) {
                try {
                  await groupService.startCycle(groupId, { start_date: date })
                  alert('Cycle started!')
                  fetchCycleStatus()
                } catch (err) {
                  alert(err.response?.data?.message || 'Failed to start cycle')
                }
              }
            }}
            className="btn-primary text-sm mt-3"
          >
            Start New Cycle
          </button>
        )}
      </div>
    )
  }

  const totalMembers = members.length
  const remaining = members.filter(m => !m.has_won).length

  return (
    <div className="glass-card mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Cycle #{cycle.cycle_number}</h3>
        <span className={`badge ${cycle.status === 'active' ? 'badge-open' : 'badge-pending'}`}>
          {cycle.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Rounds</p>
          <p className="font-semibold">{cycle.current_round - 1} / {cycle.total_rounds}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Members</p>
          <p className="font-semibold">{totalMembers}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Remaining</p>
          <p className="font-semibold text-[#c9a84c]">{remaining}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Status</p>
          <p className="font-semibold capitalize">{cycle.status}</p>
        </div>
      </div>

      {cycle.Rounds?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#1a2f57]">
          <p className="text-sm text-gray-400 mb-2">🏆 Rounds</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {cycle.Rounds.map((r) => (
              <div key={r.id} className="flex justify-between text-sm">
                <span>Round {r.round_number}: {r.winner?.full_name || r.fixedWinner?.full_name || 'Pending'}</span>
                <span className="text-[#c9a84c]">ETB {r.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[#1a2f57]">
        <p className="text-sm text-gray-400 mb-2">Members</p>
        <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
          {members.map((m) => (
            <div key={m.user_id} className="flex justify-between text-sm">
              <span>{m.User?.full_name || 'Unknown'}</span>
              <span className={m.has_won ? 'text-green-400' : 'text-gray-400'}>
                {m.has_won ? '✅' : '⏳'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isCreator && (
        <div className="mt-4 pt-4 border-t border-[#1a2f57] flex flex-wrap gap-2">
          {cycle.current_round <= cycle.total_rounds && (
            <button onClick={handleDraw} className="btn-primary text-sm">
              🎲 Draw Winner
            </button>
          )}
          {cycle.current_round > cycle.total_rounds && (
            <>
              <button onClick={() => handleEndCycle('reform')} className="btn-secondary text-sm">
                🔄 Reform Group
              </button>
              <button onClick={() => handleEndCycle('dismantle')} className="btn-danger text-sm">
                💔 Dismantle
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}