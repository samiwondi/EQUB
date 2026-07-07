import { api } from './api'

export const groupService = {
  // CRUD
  getGroups: (params = {}) => api.get('/groups', { params }),
  getGroup: (id) => api.get(`/groups/${id}`),
  createGroup: (data) => api.post('/groups', data),
  updateGroup: (id, data) => api.put(`/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/groups/${id}`),

  // Public groups
  getPublicGroups: () => api.get('/groups/public'),

  // Join requests
  requestJoin: (groupId, data = {}) => api.post(`/groups/${groupId}/request-join`, data),
  getPendingRequests: (groupId) => api.get(`/groups/${groupId}/requests`),
  approveRequest: (groupId, userId) => api.put(`/groups/${groupId}/requests/${userId}`, { action: 'approve' }),
  denyRequest: (groupId, userId) => api.put(`/groups/${groupId}/requests/${userId}`, { action: 'deny' }),

  // Invites
  inviteUser: (groupId, email) => api.post(`/groups/${groupId}/invite`, { email }),
  getInvites: (groupId) => api.get(`/groups/${groupId}/invites`),
  acceptInvite: (token) => api.post(`/invites/${token}/accept`),
  declineInvite: (token) => api.delete(`/invites/${token}`),

  // Membership
  joinGroup: (groupId) => api.post(`/groups/${groupId}/join`),
  leaveGroup: (groupId) => api.delete(`/groups/${groupId}/leave`),
  getMembers: (groupId) => api.get(`/groups/${groupId}/members`),

  // Contributions
  contribute: (groupId, data) => api.post(`/groups/${groupId}/contribute`, data),
  getContributions: (groupId) => api.get(`/groups/${groupId}/contributions`),

  // Rounds
  getRounds: (groupId) => api.get(`/groups/${groupId}/rounds`),
}