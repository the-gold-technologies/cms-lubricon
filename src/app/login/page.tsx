'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { InputField } from '@/app/components/InputField';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@lubricon.in');
  const [password, setPassword] = useState('Admin@123');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid admin credentials. Please verify your login details.');
      } else {
        toast.success('Logged in successfully!');
        router.push('/');
        router.refresh();
      }
    } catch {
      toast.error('An unexpected error occurred while logging in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070d1e] font-sans px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#ffe000]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md p-8 sm:p-10 bg-[#0e172e] rounded-[2.5rem] shadow-2xl border border-white/10 relative z-10 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ffe000] text-black font-black text-2xl shadow-lg shadow-[#ffe000]/20 mb-4 italic">
            L
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Lubricon <span className="text-[#ffe000]">CMS</span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Enterprise Content & Catalog Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lubricon.in"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 focus:border-[#ffe000] focus:ring-1 focus:ring-[#ffe000] rounded-2xl text-white text-sm font-medium outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 focus:border-[#ffe000] focus:ring-1 focus:ring-[#ffe000] rounded-2xl text-white text-sm font-medium outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#ffe000] hover:bg-[#fff066] text-black rounded-2xl font-black uppercase tracking-wider transition-all shadow-lg shadow-[#ffe000]/25 disabled:opacity-50 cursor-pointer text-xs flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Admin Portal • Australian Formulation Tech</span>
          </div>
          <p className="text-zinc-500 text-[10px] mt-2">
            &copy; {new Date().getFullYear()} Lubricon Specialities India. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
