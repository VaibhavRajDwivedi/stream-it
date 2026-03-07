'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { login, isLoggingIn, authUser } = useAuthStore();
  const router = useRouter();

  // Evaluates session context enforcing redirect flow
  useEffect(() => {
    if (authUser) {
      router.push('/');
    }
  }, [authUser, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
        <h1 className="text-3xl font-bold text-center text-white">Welcome Back</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              className="w-full p-3 bg-zinc-800 rounded outline-none focus:ring-2 focus:ring-red-500 text-white transition"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              className="w-full p-3 bg-zinc-800 rounded outline-none focus:ring-2 focus:ring-red-500 text-white transition"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            disabled={isLoggingIn}
            className="w-full py-3 mt-4 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold rounded transition flex justify-center items-center"
          >
            {isLoggingIn ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-center text-zinc-400 text-sm">
          Don't have an account? <Link href="/signup" className="text-red-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}