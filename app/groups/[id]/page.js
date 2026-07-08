'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import RequestList from '../../components/RequestList'
import InviteModal from '../../components/InviteModal'
import CycleStatus from '../../components/CycleStatus'
import { groupService } from '../../services/groupService'

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id

  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [membershipStatus, setMembershipStatus] = useState(null)
  const [isCreator, setIsCreator] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState([])
  const [activeCycle, setActiveCycle] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setCurrentUser(JSON.parse(stored))
  }, [])

  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await groupService.getGroup(groupId)
      const data = res.data
      setGroup(data)

      if (currentUser && data.created_by === currentUser.id) {
        setIsCreator(true)
      }

      if (currentUser && data.Memberships) {
        const membership = data.Memberships.find(m => m.user_id === currentUser.id)
        if (membership) setMembershipStatus(membership.role)
      }

      setMembers(data.Memberships || [])
      setContributions(data.Contributions || [])

      const cycle = data.Cycles?.find(c => c.status === 'active')
      setActiveCycle(cycle)

    } catch (err) {
      console.error('Failed to fetch group:', err)
      setError('Failed to load group details')
    } finally {
      setLoading(false)
    }
  }, [groupId, currentUser])

  useEffect(() => {
    if (currentUser) fetchGroupData()
  }, [fetchGroupData, currentUser, refreshKey])

  const handleJoinRequest = async (message) => {
    try {
      await groupService.requestJoin(groupId, { message })
      setMembershipStatus('pending')
      alert('Request sent! The group creator will review it.')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request')
    }
  }

  const handleJoin = async () => {
    try {
      await groupService.joinGroup(groupId)
      setMembershipStatus('member')
      alert('You have joined the group!')
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join')
    }
  }

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return
    try {
      await groupService.leaveGroup(groupId)
      setMembershipStatus(null)
      alert('You have left the group.')
      router.push('/groups')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave group')
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a84c] inline-block"></div><p className="text-gray-400 mt-4">Loading...</p></div>
  }

  if (error || !group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass-card max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
          <p className="text-gray-400">{error || 'This group may have been deleted.'}</p>
          <Link href="/groups"><button className="btn-primary mt-4">Browse Groups</button></Link>
        </div>
      </div>
    )
  }

  if (group.privacy === 'private' && membershipStatus !== 'member' && !isCreator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass-card max-w-md mx-auto">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Private Group</h2>
          <p className="text-gray-400">This group is private. You need an invitation to join.</p>
          <Link href="/groups"><button className="btn-primary mt-4">Browse Groups</button></Link>
        </div>
      </div>
    )
  }

  const currentRound = activeCycle?.current_round || 1
  const totalRounds = activeCycle?.total_rounds || group.max_members

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
        <span>→</span>
        <Link href="/groups" className="hover:text-white">Groups</Link>
        <span>→</span>
        <span className="text-[#c9a84c]">{group.name}</span>
      </div>

      <div className="glass-card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <span className={`badge ${group.privacy === 'public' ? 'badge-open' : 'badge-pending'}`}>
                {group.privacy === 'public' ? '🌐 Public' : '🔒 Private'}
              </span>
              <span className={`badge ${group.status === 'open' ? 'badge-open' : group.status === 'closed' ? 'badge-pending' : group.status === 'completed' ? 'badge-open' : 'badge-pending'}`}>
                {group.status}
              </span>
            </div>
            <p className="text-gray-400">{group.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs bg-[#1a2f57] px-3 py-1 rounded-full text-gray-300">{group.category || 'General'}</span>
              <span className="text-xs bg-[#1a2f57] px-3 py-1 rounded-full text-gray-300">📅 {new Date(group.created_at).toLocaleDateString()}</span>
              <span className="text-xs bg-[#1a2f57] px-3 py-1 rounded-full text-gray-300">👤 Created by {group.creator?.full_name || 'Admin'}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isCreator && <button className="btn-secondary text-sm">⚙️ Manage</button>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1a2f57]">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Members</p>
            <p className="text-2xl font-bold">{members.filter(m => m.role === 'member' || m.role === 'admin').length}/{group.max_members}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Contribution</p>
            <p className="text-2xl font-bold text-[#c9a84c]">ETB {group.contribution_amount}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Saved</p>
            <p className="text-2xl font-bold text-[#c9a84c]">ETB {contributions.reduce((sum, c) => sum + c.amount, 0)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Progress</p>
            <p className="text-xl font-bold">Round {currentRound}/{totalRounds}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#1a2f57]">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Progress</span>
            <span className="text-[#c9a84c]">Round {currentRound} of {totalRounds}</span>
          </div>
          <div className="w-full bg-[#0a1628] rounded-full h-2">
            <div className="bg-gradient-to-r from-[#c9a84c] to-[#a8893a] h-2 rounded-full transition-all duration-500" style={{ width: `${(currentRound / totalRounds) * 100}%` }}></div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#1a2f57] flex flex-wrap gap-3">
          {!isCreator && membershipStatus === 'member' && (
            <>
              <button className="btn-primary">💰 Make Contribution</button>
              <button onClick={handleLeave} className="btn-danger text-sm">Leave Group</button>
            </>
          )}
          {!isCreator && membershipStatus === 'pending' && (
            <button disabled className="btn-secondary text-sm">⏳ Awaiting Approval</button>
          )}
          {!isCreator && membershipStatus === 'invited' && (
            <button onClick={handleJoin} className="btn-primary text-sm">✅ Accept Invitation</button>
          )}
          {!isCreator && !membershipStatus && group.privacy === 'public' && group.status === 'open' && (
            <button onClick={() => { const message = prompt('Optional: Why do you want to join this group?'); handleJoinRequest(message) }} className="btn-primary text-sm">Request to Join</button>
          )}
          {!isCreator && !membershipStatus && group.privacy === 'private' && (
            <span className="text-gray-400 text-sm">🔒 Private group - invitation required</span>
          )}
          {isCreator && group.privacy === 'private' && (
            <button onClick={() => setShowInviteModal(true)} className="btn-primary">+ Invite Members</button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="glass-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">👥 Members <span className="text-sm text-gray-400">({members.length})</span></h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {members.map(member => (
                <div key={member.user_id} className="flex justify-between items-center p-2 hover:bg-[#1a2f57] rounded-lg transition">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#23406e] to-[#2c5085] flex items-center justify-center text-xs font-bold">{member.User?.full_name?.[0] || 'U'}</div>
                    <div>
                      <p className="text-sm font-medium">{member.User?.full_name || 'User'}</p>
                      {member.role === 'admin' && <span className="text-[10px] text-[#c9a84c]">⭐ Admin</span>}
                      {member.role === 'pending' && <span className="text-[10px] text-yellow-400">⏳ Pending</span>}
                      {member.role === 'invited' && <span className="text-[10px] text-blue-400">📨 Invited</span>}
                    </div>
                  </div>
                  {member.role === 'admin' && <span className="text-[#c9a84c] text-xs">⭐</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="glass-card mb-6">
            <h2 className="text-lg font-bold mb-4">🔄 Rounds</h2>
            {activeCycle?.Rounds?.length > 0 ? (
              <div className="space-y-3">
                {activeCycle.Rounds.map(round => (
                  <div key={round.round_number} className="flex justify-between items-center p-3 bg-[#0a1628] rounded-lg">
                    <div>
                      <p className="font-semibold">Round {round.round_number}</p>
                      <p className="text-xs text-gray-400">Total: ETB {round.amount}</p>
                      {round.is_fixed && <p className="text-xs text-[#c9a84c]">Fixed: {round.fixedWinner?.full_name || 'Unknown'}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`badge ${round.status === 'paid' ? 'badge-open' : 'badge-pending'}`}>{round.status}</span>
                      {round.winner && <span className="text-xs text-gray-400">Winner: {round.winner.full_name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No rounds yet. Start a cycle to begin.</p>
            )}
          </div>

          <div className="glass-card">
            <h2 className="text-lg font-bold mb-4">💳 Recent Contributions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-xs uppercase border-b border-[#1a2f57]">
                    <th className="pb-3 px-2">Member</th>
                    <th className="pb-3 px-2">Round</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.length === 0 ? (
                    <tr><td colSpan="4" className="py-4 text-center text-gray-400 text-sm">No contributions yet</td></tr>
                  ) : (
                    contributions.slice(0, 5).map(item => (
                      <tr key={item.id} className="border-b border-[#1a2f57] last:border-0">
                        <td className="py-3 px-2 text-sm">{item.User?.full_name || 'User'}</td>
                        <td className="py-3 px-2 text-sm text-gray-400">Round {item.round_number}</td>
                        <td className="py-3 px-2 text-sm text-[#c9a84c]">ETB {item.amount}</td>
                        <td className="py-3 px-2"><span className={`badge ${item.status === 'paid' ? 'badge-open' : 'badge-pending'}`}>{item.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {isCreator && (
            <RequestList groupId={groupId} isCreator={isCreator} onUpdate={() => setRefreshKey(prev => prev + 1)} />
          )}

          <CycleStatus groupId={groupId} isCreator={isCreator} />
        </div>
      </div>

      {showInviteModal && (
        <InviteModal groupId={groupId} onClose={() => setShowInviteModal(false)} onInvite={() => setRefreshKey(prev => prev + 1)} />
      )}
    </div>
  )
}