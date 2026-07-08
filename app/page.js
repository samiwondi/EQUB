'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from './services/authService'

export default function HomePage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fayda_id: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'member'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password)
      } else {
        await authService.register({
          fayda_id: formData.fayda_id,
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role
        })
      }
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
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

        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
                  <label className="block text-gray-300 mb-1 text-sm">Fayda ID *</label>
                  <input
                    type="text"
                    name="fayda_id"
                    value={formData.fayda_id}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="FID-1234567890"
                    required={!isLogin}
                  />
                </div>
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

            <button type="submit" className="btn-primary w-full text-lg" disabled={loading}>
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
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