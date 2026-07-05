'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'member'
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (isLogin) {
      const mockUser = {
        id: 1,
        full_name: 'Abebe Kebede',
        email: formData.email,
        role: 'member',
        phone: '+251 9XX XXX XXX',
        joinDate: 'Jan 2024',
        groupsJoined: 3,
        totalSaved: 'ETB 12,500'
      }
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', 'mock-token')
      router.push('/dashboard')
    } else {
      const mockUser = {
        id: 1,
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone || '+251 9XX XXX XXX',
        joinDate: 'Dec 2024',
        groupsJoined: 0,
        totalSaved: 'ETB 0'
      }
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('token', 'mock-token')
      router.push('/dashboard')
    }
  }

  return (
    <div className="auth-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Brand */}
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="gradient-text">እቁብ</span>
            </h1>
            <p className="text-2xl text-gray-300">Digital Equb Platform</p>
          </div>
          <p className="text-gray-400 text-lg max-w-md">
            Join or create community savings groups. Save together, grow together.
          </p>
          <div className="flex gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-gold">✓</span> 500+ Groups
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gold">✓</span> 10K+ Members
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gold">✓</span> ETB 2.5M+ Saved
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Toggle */}
          <div className="flex gap-2 bg-[#0a1628]/50 p-1 rounded-xl mb-6">
            <button
              className={`flex-1 py-2 px-4 rounded-lg transition ${
                isLogin ? 'bg-[#c9a84c] text-[#0a1628] font-semibold' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-lg transition ${
                !isLogin ? 'bg-[#c9a84c] text-[#0a1628] font-semibold' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+251 9XX XXX XXX"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-300 mb-1 text-sm">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1 text-sm">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Min 8 characters"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-300 mb-1 text-sm">I want to</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="member">Join Groups</option>
                  <option value="organizer">Create & Manage Groups</option>
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full text-lg">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-500 border-t border-[#1a2f57] pt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  )
}