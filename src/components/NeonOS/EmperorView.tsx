import React, { useState } from 'react';
import { 
  Briefcase, TrendingUp, Building2, Store, Globe, Users, DollarSign,
  Video, Film, Share2, Award, Plus, BarChart3, ShoppingBag, MapPin,
  Sparkles, CheckCircle2, MessageSquare, Play, Heart, Eye
} from 'lucide-react';
import { EmperorCompany, CreatorPost } from './types';
import { soundService } from '../../services/soundService';

const INITIAL_COMPANIES: EmperorCompany[] = [
  { id: 'comp_1', name: 'Aether Dynamics Corp', industry: 'Cybernetics & Defense', valuationCredits: 4250000, monthlyRevenue: 340000, employees: 48, productsCount: 12, rating: 4.9 },
  { id: 'comp_2', name: 'Neon Apex Real Estate', industry: 'Virtual Land & Meta-Estates', valuationCredits: 8900000, monthlyRevenue: 620000, employees: 32, productsCount: 85, rating: 4.8 },
  { id: 'comp_3', name: 'Hyperion Quantum Cloud', industry: 'Decentralized Server Grids', valuationCredits: 12400000, monthlyRevenue: 1100000, employees: 95, productsCount: 24, rating: 5.0 },
  { id: 'comp_4', name: 'CyberBlade Media Studios', industry: 'Creator Streaming & Cinema', valuationCredits: 2100000, monthlyRevenue: 180000, employees: 18, productsCount: 340, rating: 4.7 }
];

const INITIAL_POSTS: CreatorPost[] = [
  { id: 'post_1', title: 'INSANE 360° TANK RICOCHET SHOT IN COMBINED ARMS', type: 'reel', views: 240500, likes: 18900, revenue: 1420, date: '2 hours ago' },
  { id: 'post_2', title: 'TOP 10 SECRET ROOFTOPS IN FREERUN CITY', type: 'short', views: 512000, likes: 42300, revenue: 3200, date: 'Yesterday' },
  { id: 'post_3', title: 'NEON MATRIX: THE FALL OF SECTOR 7 (CINEMATIC MOVIE)', type: 'movie', views: 890000, likes: 78500, revenue: 7850, date: '3 days ago' }
];

export const EmperorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'business' | 'digital_land' | 'creator_studio' | 'social_feed'>('business');
  const [companies, setCompanies] = useState<EmperorCompany[]>(INITIAL_COMPANIES);
  const [posts, setPosts] = useState<CreatorPost[]>(INITIAL_POSTS);
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    soundService.playSFX('powerup');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    const newComp: EmperorCompany = {
      id: `comp_${Date.now()}`,
      name: companyName,
      industry: companyIndustry || 'Tech Ventures',
      valuationCredits: 1000000,
      monthlyRevenue: 75000,
      employees: 6,
      productsCount: 1,
      rating: 5.0
    };
    setCompanies(prev => [newComp, ...prev]);
    setCompanyName('');
    setCompanyIndustry('');
    setIsCreatingCompany(false);
    showToast(`Registered enterprise: "${newComp.name}" under Emperor Global Registry!`);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-white font-mono select-none overflow-hidden">
      {/* Top Emperor Header */}
      <div className="bg-zinc-900 border-b border-amber-500/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-400">
            <Briefcase size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-amber-400 uppercase tracking-tight">EMPEROR BUSINESS & CREATOR PLATFORM</h2>
              <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                SUITE ≈ 400 GB
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Corporate Management • Digital Assets • Creator Video Monetization • Social Ecosystem
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('business')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'business' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Enterprises ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('digital_land')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'digital_land' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Digital Land
          </button>
          <button
            onClick={() => setActiveTab('creator_studio')}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
              activeTab === 'creator_studio' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Reels & Movies
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-amber-400 text-black px-4 py-1.5 text-xs font-black tracking-wide text-center uppercase">
          ✓ {notification}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'business' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Business KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Total Corporate Valuation</span>
                <h3 className="text-xl font-black text-amber-400 mt-1">27,650,000 CR</h3>
                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">↑ +14.2% this quarter</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Monthly Dividend Revenue</span>
                <h3 className="text-xl font-black text-white mt-1">2,240,000 CR</h3>
                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">↑ +8.5% automated cashflow</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Managed Workforce</span>
                <h3 className="text-xl font-black text-white mt-1">193 Employees</h3>
                <span className="text-[10px] text-cyan-400 mt-1">Across 4 conglomerates</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Digital Products & Stores</span>
                <h3 className="text-xl font-black text-white mt-1">461 Offerings</h3>
                <span className="text-[10px] text-amber-300 mt-1">Global Marketplace Active</span>
              </div>
            </div>

            {/* Registered Companies Section */}
            <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-white uppercase">Your Portfolio Enterprises</h3>
                  <p className="text-xs text-zinc-400">Buy, sell, hire staff, create online stores, and build corporate landing sites.</p>
                </div>
                <button
                  onClick={() => setIsCreatingCompany(!isCreatingCompany)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>Found New Company</span>
                </button>
              </div>

              {/* Company Creation Form */}
              {isCreatingCompany && (
                <form onSubmit={handleCreateCompany} className="mb-6 p-4 bg-zinc-950 border border-amber-500/40 rounded-2xl flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Enter Enterprise Name..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-amber-300 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Industry (e.g. AI Robotics, Biotech, Virtual Real Estate)..."
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-amber-300 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                  <button type="submit" className="px-5 py-2 bg-amber-400 text-black font-black text-xs uppercase rounded-xl">
                    Register Entity
                  </button>
                </form>
              )}

              {/* Companies Table */}
              <div className="space-y-3">
                {companies.map(comp => (
                  <div key={comp.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-wrap items-center justify-between gap-4 hover:border-amber-500/30 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 size={18} className="text-amber-400" />
                        <h4 className="text-sm font-black text-white uppercase">{comp.name}</h4>
                        <span className="text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">{comp.industry}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
                        <span>Valuation: <strong className="text-white">{comp.valuationCredits.toLocaleString()} CR</strong></span>
                        <span>Monthly: <strong className="text-emerald-400">+{comp.monthlyRevenue.toLocaleString()} CR</strong></span>
                        <span>Staff: <strong className="text-white">{comp.employees}</strong></span>
                        <span>Products: <strong className="text-white">{comp.productsCount}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => showToast(`Launched Online Storefront for ${comp.name}`)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-bold uppercase"
                      >
                        Storefront
                      </button>
                      <button
                        onClick={() => showToast(`Dividend payout of ${(comp.monthlyRevenue * 0.1).toFixed(0)} CR deposited to wallet.`)}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-300 rounded-lg text-xs font-bold uppercase"
                      >
                        Claim Dividends
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'digital_land' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div>
              <h3 className="text-xl font-black text-white uppercase">NEON METAVERSE REAL ESTATE & DEEDS</h3>
              <p className="text-xs text-zinc-400 mt-1">Acquire virtual land parcels, construct commercial plazas, and collect tenant leases.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: 'Plaza Prime Parcel #01', zone: 'Megacity Core', price: '450,000 CR', rent: '24,000 CR/mo', status: 'Owned' },
                { title: 'Ocean Archipelago Haven #14', zone: 'Azure Coast', price: '850,000 CR', rent: '48,000 CR/mo', status: 'Available' },
                { title: 'Titan Caldera Fortress #08', zone: 'Volcano Ridge', price: '1,200,000 CR', rent: '72,000 CR/mo', status: 'Available' }
              ].map((parcel, idx) => (
                <div key={idx} className="bg-zinc-900 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{parcel.zone}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${parcel.status === 'Owned' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {parcel.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white uppercase">{parcel.title}</h4>
                    <div className="mt-4 space-y-1 text-xs text-zinc-400">
                      <div>Valuation: <strong className="text-white">{parcel.price}</strong></div>
                      <div>Yield: <strong className="text-emerald-400">{parcel.rent}</strong></div>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(parcel.status === 'Owned' ? 'Collected rental dividends.' : `Purchased ${parcel.title}!`)}
                    className="mt-6 w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase rounded-xl"
                  >
                    {parcel.status === 'Owned' ? 'Collect Rent' : 'Acquire Deed'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'creator_studio' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white uppercase">CREATOR REELS, SHORTS & MOVIES</h3>
                <p className="text-xs text-zinc-400 mt-1">Publish game highlights, movies, and tutorials. Monetize subscribers and collect ad revenue.</p>
              </div>
              <button
                onClick={() => showToast('New Reel published to Neon Arena Feed!')}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase rounded-xl flex items-center gap-1.5"
              >
                <Video size={16} />
                <span>Upload New Reel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {posts.map(post => (
                <div key={post.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-500 uppercase mb-2">
                      <span>{post.type.toUpperCase()}</span>
                      <span>{post.date}</span>
                    </div>
                    <h4 className="text-sm font-black text-white uppercase leading-snug line-clamp-2">{post.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-zinc-400 mt-4">
                      <span className="flex items-center gap-1"><Eye size={12} /> {post.views.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" /> {post.likes.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-bold">Earned: +{post.revenue} CR</span>
                    <button
                      onClick={() => showToast(`Playing ${post.title}`)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
                    >
                      <Play size={14} fill="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
