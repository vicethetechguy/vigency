"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Settings, LogOut, 
  Eye, EyeOff, Lock, RefreshCw, TrendingUp, 
  CreditCard, Ticket, Gift, Copy 
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('payments');

  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Check session storage on mount
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) {
      setPassword(savedPassword);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated or active tab changes
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchData();

    // Auto-refresh payments every 30 seconds if on payments tab
    let interval: NodeJS.Timeout;
    if (activeTab === 'payments') {
      interval = setInterval(fetchData, 30000);
    }

    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        sessionStorage.setItem('admin_password', password);
        setIsAuthenticated(true);
      } else {
        setLoginError('Invalid password');
      }
    } catch (err) {
      setLoginError('Something went wrong');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_password');
    setIsAuthenticated(false);
    setPassword('');
    setStats(null);
    setPayments([]);
    setReferrals([]);
  };

  const fetchData = async () => {
    setIsLoadingData(true);
    const headers = { 'x-admin-password': password };

    try {
      if (activeTab === 'payments') {
        const [statsRes, paymentsRes] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/admin/payments', { headers })
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (paymentsRes.ok) {
           const data = await paymentsRes.json();
           setPayments(Array.isArray(data) ? data : data.payments || []);
        }
      } else if (activeTab === 'referrals') {
        const referralsRes = await fetch('/api/admin/referrals', { headers });
        if (referralsRes.ok) {
           const data = await referralsRes.json();
           setReferrals(Array.isArray(data) ? data : data.referrals || []);
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Render Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-body">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative"
        >
          {/* Gradient glow behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#f9c80e] via-[#ff6a2a] to-[#e91eae] rounded-2xl blur-xl opacity-20"></div>
          
          <div className="relative bg-[#111111] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl shadow-[0_18px_80px_rgba(233,30,174,.1)]">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f9c80e] via-[#ff6a2a] to-[#e91eae] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,106,42,0.3)]">
                <span className="text-white text-3xl font-display font-bold">V</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-white tracking-tight">Vigency Admin</h1>
              <p className="text-white/50 text-sm mt-1">Sign in to access dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.1] rounded-xl py-3 pl-10 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-[#ff6a2a] focus:ring-1 focus:ring-[#ff6a2a] transition-all"
                  placeholder="Admin Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {loginError && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-[#ff6a2a] text-sm text-center"
                >
                  {loginError}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-[#f9c80e] via-[#ff6a2a] to-[#e91eae] text-white rounded-xl py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoggingIn ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard content rendering functions
  const renderPayments = () => {
    return (
      <motion.div
        key="payments"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              title: 'Total Revenue', 
              value: stats?.totalRevenue ? `₦${stats.totalRevenue.toLocaleString()}` : '₦0',
              icon: <TrendingUp className="h-5 w-5 text-white" />
            },
            { 
              title: 'Total Payments', 
              value: stats?.totalPayments || 0,
              icon: <CreditCard className="h-5 w-5 text-white" />
            },
            { 
              title: 'Credits Sold', 
              value: stats?.totalCreditsSold || 0,
              icon: <Ticket className="h-5 w-5 text-white" />
            },
            { 
              title: 'Tiers Sold', 
              value: `${stats?.tierCounts?.starter || 0}S / ${stats?.tierCounts?.creator || 0}C / ${stats?.tierCounts?.studio || 0}St`,
              icon: <Users className="h-5 w-5 text-white" />
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl p-[1px] bg-gradient-to-br from-white/[0.1] to-transparent overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#f9c80e]/10 via-[#ff6a2a]/10 to-[#e91eae]/10 blur-2xl rounded-full -mr-16 -mt-16"></div>
              <div className="bg-[#111111] backdrop-blur-xl rounded-2xl p-5 h-full relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f9c80e] via-[#ff6a2a] to-[#e91eae] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,106,42,0.2)]">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-white/50 text-sm font-medium">{stat.title}</p>
                  <p className="text-white text-2xl font-display font-bold mt-1">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payments Table */}
        <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden shadow-[0_18px_80px_rgba(0,0,0,0.5)]">
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-display font-bold text-white">Recent Payments</h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-500 text-xs font-medium">Live</span>
              </div>
            </div>
            <button 
              onClick={fetchData}
              className="p-2 text-white/50 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] rounded-lg transition-colors border border-white/[0.05]"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 text-xs font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Coupon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                      <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No payments yet. When a user completes checkout, their payment will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((p, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-white/60">
                        {new Date(p.createdAt || p.time || Date.now()).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-medium">{p.name || 'Anonymous'}</span>
                          <span className="text-white/40 text-xs">{p.email || p.whatsapp}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          (p.tier?.toLowerCase() === 'starter') ? 'bg-[#f9c80e]/10 text-[#f9c80e] border-[#f9c80e]/20' :
                          (p.tier?.toLowerCase() === 'creator') ? 'bg-[#ff6a2a]/10 text-[#ff6a2a] border-[#ff6a2a]/20' :
                          'bg-[#e91eae]/10 text-[#e91eae] border-[#e91eae]/20'
                        }`}>
                          {p.tier || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/80">{p.credits || 0}</td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        ₦{(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {p.couponCode ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-white/70">
                            <Ticket className="h-3 w-3" />
                            {p.couponCode}
                          </span>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderReferrals = () => {
    return (
      <motion.div
        key="referrals"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden shadow-[0_18px_80px_rgba(0,0,0,0.5)]">
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#ff6a2a]" />
              Referral Leaderboard
            </h2>
            <button 
              onClick={fetchData}
              className="p-2 text-white/50 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] rounded-lg transition-colors border border-white/[0.05]"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 text-xs font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">WhatsApp Number</th>
                  <th className="px-6 py-4">Referrals</th>
                  <th className="px-6 py-4 w-1/3">Progress to 10</th>
                  <th className="px-6 py-4">Reward Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>No referrals yet. Share the bot to get started.</p>
                    </td>
                  </tr>
                ) : (
                  referrals.map((r, i) => {
                    const count = r.referralCount || 0;
                    const progress = Math.min((count / 10) * 100, 100);
                    const hasEarned = count >= 10;
                    
                    return (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-sm text-white/40 font-mono">#{i + 1}</td>
                        <td className="px-6 py-4 text-sm text-white font-medium">{r.whatsapp}</td>
                        <td className="px-6 py-4 text-sm text-white/80">
                          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#f9c80e] to-[#ff6a2a]">
                            {count}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#f9c80e] via-[#ff6a2a] to-[#e91eae] rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-white/50 w-8">{progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {hasEarned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e91eae]/10 text-[#e91eae] border border-[#e91eae]/20 text-xs font-medium">
                              <Gift className="h-3 w-3" />
                              Earned
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.05] text-white/40 border border-white/[0.1] text-xs font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSettings = () => {
    return (
      <motion.div
        key="settings"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 max-w-3xl"
      >
        <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden shadow-[0_18px_80px_rgba(0,0,0,0.5)]">
          <div className="p-6 border-b border-white/[0.06]">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-white/50" />
              System Settings
            </h2>
          </div>
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Admin Contact</h3>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center">
                    <Users className="h-5 w-5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Admin WhatsApp Number</p>
                    <p className="text-white/40 text-xs mt-0.5">Receives payment proofs and notifications</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white/80 bg-white/[0.05] px-3 py-1.5 rounded-lg border border-white/[0.1]">
                    +234 ••• ••• ••••
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Tier Configuration</h3>
              <div className="grid gap-3">
                {[
                  { name: 'Starter', price: '₦10,000', credits: 50, color: 'from-[#f9c80e]/20 to-transparent', text: 'text-[#f9c80e]' },
                  { name: 'Creator', price: '₦20,000', credits: 150, color: 'from-[#ff6a2a]/20 to-transparent', text: 'text-[#ff6a2a]' },
                  { name: 'Studio', price: '₦50,000', credits: 500, color: 'from-[#e91eae]/20 to-transparent', text: 'text-[#e91eae]' },
                ].map((tier, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r ${tier.color} opacity-50 pointer-events-none`}></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <span className={`font-display font-bold ${tier.text} w-20`}>{tier.name}</span>
                      <span className="text-white font-medium">{tier.price}</span>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 text-white/60 text-sm">
                      <Ticket className="h-4 w-4" />
                      {tier.credits} credits
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#f9c80e]/10 border border-[#f9c80e]/20 rounded-xl p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-[#f9c80e] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[#f9c80e] font-medium text-sm">Read-only Configuration</h4>
                <p className="text-[#f9c80e]/70 text-sm mt-1">
                  To change system settings, update your environment variables in your hosting provider and redeploy the application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] font-body text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f9c80e] via-[#ff6a2a] to-[#e91eae] flex items-center justify-center shadow-[0_0_15px_rgba(255,106,42,0.3)]">
              <span className="text-white text-sm font-display font-bold">V</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Vigency Admin</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 border-b border-white/[0.06] mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
            { id: 'referrals', label: 'Referrals', icon: <Users className="h-4 w-4" /> },
            { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/80'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#f9c80e] via-[#ff6a2a] to-[#e91eae]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'referrals' && renderReferrals()}
          {activeTab === 'settings' && renderSettings()}
        </AnimatePresence>
      </main>
    </div>
  );
}
