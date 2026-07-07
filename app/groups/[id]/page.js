'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import RequestList from '../../components/RequestList'
import InviteModal from '../../components/InviteModal'
import { groupService } from '../../services/groupService'

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id

  // State
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [membershipStatus, setMembershipStatus] = useState(null) // 'member' | 'pending' | 'invited' | null
  const [isCreator, setIsCreator] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)
  const [members, setMembers] = useState([])
  const [contributions, setContributions] = useState([])
  const [rounds, setRounds] = useState([])

  // Fetch current user
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setCurrentUser(JSON.parse(stored))
    }
  }, [])

  // Fetch group data
  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await groupService.getGroup(groupId)
      const data = res.data

      setGroup(data)

      // Check if current user is creator
      if (currentUser && data.created_by === currentUser.id) {
        setIsCreator(true)
      }

      // Check membership status
      if (currentUser && data.members) {
        const membership = data.members.find(m => m.user_id === currentUser.id)
        if (membership) {
          setMembershipStatus(membership.role)
        }
      }

      // Set members, contributions, rounds
      setMembers(data.members || [])
      setContributions(data.contributions || [])
      setRounds(data.rounds || [])

    } catch (err) {
      console.error('Failed to fetch group:', err)
      setError('Failed to load group details')
      // Fallback to mock data
      setGroup({
        id: groupId,
        name: 'Family Savings Circle',
        description: 'Monthly savings for family members to support each other',
        category: 'Family',
        privacy: 'public',
        contribution_amount: 1000,
        frequency: 'monthly',
        max_members: 10,
        total_rounds: 12,
        current_round: 3,
        status: 'active',
        created_by: 2,
        created_at: '2024-11-01',
        members: [
          { user_id: 2, full_name: 'Abebe Kebede', role: 'admin', joined_at: '2024-11-01' },
          { user_id: 3, full_name: 'Tigist Desta', role: 'member', joined_at: '2024-11-01' },
          { user_id: 4, full_name: 'Kebede Lemma', role: 'member', joined_at: '2024-11-15' },
        ],
        contributions: [
          { id: 1, user_id: 2, full_name: 'Abebe Kebede', amount: 1000, round: 1, status: 'paid', paid_at: '2024-11-25' },
          { id: 2, user_id: 3, full_name: 'Tigist Desta', amount: 1000, round: 1, status: 'paid', paid_at: '2024-11-25' },
        ],
        rounds: [
          { round_number: 1, total_amount: 3000, status: 'completed', winner: 'Tigist Desta' },
          { round_number: 2, total_amount: 3000, status: 'pending', winner: null },
        ]
      })
      // Set mock membership status
      if (currentUser) {
        setIsCreator(currentUser.id === 2)
        setMembershipStatus('member')
      }
    } finally {
      setLoading(false)
    }
  }, [groupId, currentUser])

  useEffect(() => {
    if (currentUser) {
      fetchGroupData()
    }
  }, [fetchGroupData, currentUser, refreshKey])

  // Handlers
  const handleJoinRequest = async (message) => {
    try {
      await groupService.requestJoin(groupId, { message })
      setMembershipStatus('pending')
      alert('Request sent! The group creator will review it.')
    } catch (err) {
      alert('Failed to send request. Please try again.')
    }
  }

  const handleJoin = async () => {
    try {
      await groupService.joinGroup(groupId)
      setMembershipStatus('member')
      alert('You have joined the group!')
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      alert('Failed to join. Please try again.')
    }
  }

  const handleLeave = async () => {
    if (confirm('Are you sure you want to leave this group?')) {
      try {
        await groupService.leaveGroup(groupId)
        setMembershipStatus(null)
        alert('You have left the group.')
        router.push('/groups')
      } catch (err) {
        alert('Failed to leave group. Please try again.')
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a84c]"></div>
        <p className="text-gray-400 mt-4">Loading group details...</p>
      </div>
    )
  }

  // Error state
  if (error || !group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass-card max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
          <p className="text-gray-400">{error || 'This group may have been deleted or does not exist.'}</p>
          <Link href="/groups">
            <button className="btn-primary mt-4">Browse Groups</button>
          </Link>
        </div>
      </div>
    )
  }

  // Private group - non-members shouldn't see it
  if (group.privacy === 'private' && membershipStatus !== 'member' && !isCreator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass-card max-w-md mx-auto">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Private Group</h2>
          <p className="text-gray-400">This group is private. You need an invitation to join.</p>
          <Link href="/groups">
            <button className="btn-primary mt-4">Browse Public Groups</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
        <span>→</span>
        <Link href="/groups" className="hover:text-white">Groups</Link>
        <span>→</span>
        <span className="text-[#c9a84c]">{group.name}</span>
      </div>

      {/* Group Header */}
      <div className="glass-card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <span className={`badge ${group.privacy === 'public' ? 'badge-open' : 'badge-pending'}`}>
                {group.privacy === 'public' ? '🌐 Public' : '🔒 Private'}
              </span>
            </div>
            <p className="text-gray-400">{group.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs bg-[#1a2f57] px-3 py-1 rounded-full text-gray-300">
                {group.category || 'General'}
              </span>
              <span className="text-xs bg-[#1a2f57] px-3 py-1 rounded-full text-gray-300">
                📅 {new Date(group.created_at).toLocaleDateString()}
              </span>
              <span className="text-xs bg-[#1a2f57] px-3 py-1 rounded-full text-gray-300">
                👤 Created by {group.created_by_name || 'Admin'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${group.status === 'active' ? 'badge-open' : group.status === 'completed' ? 'badge-completed' : 'badge-pending'}`}>
              {group.status}
            </span>
            {isCreator && (
              <button className="btn-secondary text-sm">
                ⚙️ Manage
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1a2f57]">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Members</p>
            <p className="text-2xl font-bold">{members.length}/{group.max_members}</p>
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
            <p className="text-xl font-bold">Round {group.current_round || 1}/{group.total_rounds || 12}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-[#1a2f57]">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Progress</span>
            <span className="text-[#c9a84c]">
              Round {group.current_round || 1} of {group.total_rounds || 12}
            </span>
          </div>
          <div className="w-full bg-[#0a1628] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#c9a84c] to-[#a8893a] h-2 rounded-full transition-all duration-500"
              style={{ width: `${((group.current_round || 1) / (group.total_rounds || 12)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-[#1a2f57] flex flex-wrap gap-3">
          {!isCreator && membershipStatus === 'member' && (
            <>
              <button className="btn-primary">
                💰 Make Contribution
              </button>
              <button 
                onClick={handleLeave}
                className="btn-danger text-sm"
              >
                Leave Group
              </button>
            </>
          )}
          {!isCreator && membershipStatus === 'pending' && (
            <button disabled className="btn-secondary text-sm">
              ⏳ Awaiting Approval
            </button>
          )}
          {!isCreator && membershipStatus === 'invited' && (
            <button 
              onClick={handleJoin}
              className="btn-primary text-sm"
            >
              ✅ Accept Invitation
            </button>
          )}
          {!isCreator && !membershipStatus && group.privacy === 'public' && (
            <button 
              onClick={() => {
                const message = prompt('Optional: Why do you want to join this group?')
                handleJoinRequest(message)
              }}
              className="btn-primary text-sm"
            >
              Request to Join
            </button>
          )}
          {!isCreator && !membershipStatus && group.privacy === 'private' && (
            <span className="text-gray-400 text-sm">🔒 Private group - invitation required</span>
          )}
          {isCreator && group.privacy === 'private' && (
            <button 
              onClick={() => setShowInviteModal(true)}
              className="btn-primary"
            >
              + Invite Members
            </button>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="glass-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              👥 Members
              <span className="text-sm text-gray-400">({members.length})</span>
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {members.map((member) => (
                <div key={member.user_id} className="flex justify-between items-center p-2 hover:bg-[#1a2f57] rounded-lg transition">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#23406e] to-[#2c5085] flex items-center justify-center text-xs font-bold">
                      {member.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.full_name || 'User'}</p>
                      {member.role === 'admin' && (
                        <span className="text-[10px] text-[#c9a84c]">⭐ Admin</span>
                      )}
                      {member.role === 'pending' && (
                        <span className="text-[10px] text-yellow-400">⏳ Pending</span>
                      )}
                      {member.role === 'invited' && (
                        <span className="text-[10px] text-blue-400">📨 Invited</span>
                      )}
                    </div>
                  </div>
                  {member.role === 'admin' && (
                    <span className="text-[#c9a84c] text-xs">⭐</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contributions & Rounds */}
        <div className="md:col-span-2">
          {/* Rounds Timeline */}
          <div className="glass-card mb-6">
            <h2 className="text-lg font-bold mb-4">🔄 Rounds</h2>
            <div className="space-y-3">
              {rounds.length === 0 ? (
                <p className="text-gray-400 text-sm">No rounds yet</p>
              ) : (
                rounds.map((round) => (
                  <div key={round.round_number} className="flex justify-between items-center p-3 bg-[#0a1628] rounded-lg">
                    <div>
                      <p className="font-semibold">Round {round.round_number}</p>
                      <p className="text-xs text-gray-400">Total: ETB {round.total_amount}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`badge ${round.status === 'completed' ? 'badge-open' : 'badge-pending'}`}>
                        {round.status}
                      </span>
                      {round.status === 'completed' && round.winner && (
                        <span className="text-xs text-gray-400">
                          Winner: {round.winner}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Contributions */}
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
                    <tr>
                      <td colSpan="4" className="py-4 text-center text-gray-400 text-sm">
                        No contributions yet
                      </td>
                    </tr>
                  ) : (
                    contributions.slice(0, 5).map((item) => (
                      <tr key={item.id} className="border-b border-[#1a2f57] last:border-0">
                        <td className="py-3 px-2 text-sm">{item.full_name || 'User'}</td>
                        <td className="py-3 px-2 text-sm text-gray-400">Round {item.round}</td>
                        <td className="py-3 px-2 text-sm text-[#c9a84c]">ETB {item.amount}</td>
                        <td className="py-3 px-2">
                          <span className={`badge ${item.status === 'paid' ? 'badge-open' : 'badge-pending'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Request List - Creator Only */}
          {isCreator && (
            <RequestList 
              groupId={groupId}
              isCreator={isCreator}
              onUpdate={() => setRefreshKey(prev => prev + 1)}
            />
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          groupId={groupId}
          onClose={() => setShowInviteModal(false)}
          onInvite={() => {
            setRefreshKey(prev => prev + 1)
          }}
        />
      )}
    </div>
  )
}