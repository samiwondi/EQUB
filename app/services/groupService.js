import { api } from './api'

export const groupService = {
  getGroups: (params = {}) => api.get('/groups', { params }),
  getGroup: (id) => api.get(`/groups/${id}`),
  createGroup: (data) => api.post('/groups', data),
  updateGroup: (id, data) => api.put(`/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/groups/${id}`),
  getPublicGroups: () => api.get('/groups/public'),

  requestJoin: (groupId, data = {}) => api.post(`/groups/${groupId}/request-join`, data),
  getPendingRequests: (groupId) => api.get(`/groups/${groupId}/requests`),
  approveRequest: (groupId, userId) => api.put(`/groups/${groupId}/requests/${userId}`, { action: 'approve' }),
  denyRequest: (groupId, userId) => api.put(`/groups/${groupId}/requests/${userId}`, { action: 'deny' }),

  inviteUser: (groupId, email) => api.post(`/groups/${groupId}/invite`, { email }),
  getInvites: (groupId) => api.get(`/groups/${groupId}/invites`),
  acceptInvite: (token) => api.post(`/invites/${token}/accept`),
  declineInvite: (token) => api.delete(`/invites/${token}`),

  joinGroup: (groupId) => api.post(`/groups/${groupId}/join`),
  leaveGroup: (groupId) => api.delete(`/groups/${groupId}/leave`),
  getMembers: (groupId) => api.get(`/groups/${groupId}/members`),

  contribute: (groupId, data) => api.post(`/groups/${groupId}/contribute`, data),
  getContributions: (groupId) => api.get(`/groups/${groupId}/contributions`),
  getRounds: (groupId) => api.get(`/groups/${groupId}/rounds`),

  startCycle: (groupId, data) => api.post(`/groups/${groupId}/cycle/start`, data),
  drawWinner: (groupId) => api.post(`/groups/${groupId}/cycle/draw`),
  getCycleStatus: (groupId) => api.get(`/groups/${groupId}/cycle/status`),
  endCycle: (groupId, action) => api.post(`/groups/${groupId}/cycle/end`, { action }),
}