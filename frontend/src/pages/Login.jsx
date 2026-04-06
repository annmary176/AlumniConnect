// A beautiful glassmorphism login/register page with Framer Motion animations
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', userType: 'Student', companyName: '', jobTitle: '', yearsExperience: '', graduationYear: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email: formData.email, password: formData.password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } else {
        const res = await axios.post('http://localhost:5000/api/auth/register', formData);
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-panel p-8 w-full max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-lg">
            <Network size={32} />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">AlumniConnect</h2>
        <p className="text-center text-slate-500 mb-8">
          {isLogin ? 'Welcome back! Please login.' : 'Join the network today.'}
        </p>

        {error && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${error.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text" required placeholder="Full Name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
            />
          )}

          <input
            type="email" required placeholder="Email Address"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password" required placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
          />

          {!isLogin && (
            <>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                value={formData.userType} onChange={e => setFormData({...formData, userType: e.target.value})}
              >
                <option value="Student">Student</option>
                <option value="Alumni">Alumni</option>
              </select>

              {formData.userType === 'Alumni' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4">
                  <input type="text" required placeholder="Company Name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  <input type="text" required placeholder="Job Title" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
                  <div className="flex space-x-4">
                    <input type="number" required placeholder="Years Exp" className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.yearsExperience} onChange={e => setFormData({...formData, yearsExperience: e.target.value})} />
                    <input type="number" required placeholder="Grad Year" className="w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.graduationYear} onChange={e => setFormData({...formData, graduationYear: e.target.value})} />
                  </div>
                </motion.div>
              )}
            </>
          )}

          <button type="submit" className="w-full primary-gradient py-3 rounded-xl font-semibold text-lg flex justify-center items-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
