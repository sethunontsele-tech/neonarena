import { motion } from 'motion/react';
import { X, Heart, CreditCard, Wallet, Coins, Gift } from 'lucide-react';
import { useGameStore } from '../store';

export const DonateModal = () => {
  const setDonateModalOpen = useGameStore(state => state.setDonateModalOpen);

  const donationOptions = [
    { amount: '$5', label: 'Supporter', icon: <Heart className="text-red-400" /> },
    { amount: '$10', label: 'Elite Supporter', icon: <Zap size={24} className="text-amber-400" /> },
    { amount: '$25', label: 'Legendary Supporter', icon: <Sparkles size={24} className="text-purple-400" /> },
    { amount: 'Custom', label: 'Any Amount', icon: <Gift className="text-blue-400" /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] pointer-events-auto p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-zinc-950 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-2xl flex flex-col shadow-[0_0_100px_rgba(245,158,11,0.1)] relative overflow-hidden"
      >
        {/* Decorative Background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/5 blur-[100px] rounded-full" />
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-2">SUPPORT THE ARENA</h2>
            <div className="flex gap-4 items-center">
              <div className="h-1 w-24 bg-amber-400" />
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Help us keep the servers running</span>
            </div>
          </div>
          <button 
            onClick={() => setDonateModalOpen(false)}
            className="group flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white hover:text-black transition-all"
          >
            <X size={16} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        <div className="mb-8 text-white/60 text-sm leading-relaxed relative z-10">
          Your donations help us maintain the servers, develop new features, and keep Neon Arena free for everyone. Every contribution, no matter how small, makes a huge difference!
        </div>

        {/* Donation Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
          {donationOptions.map((option) => (
            <button
              key={option.label}
              className="group bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-amber-400/50 hover:bg-amber-400/5 transition-all text-left flex flex-col gap-4"
            >
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {option.icon}
              </div>
              <div>
                <div className="text-2xl font-black text-white">{option.amount}</div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{option.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col gap-4 relative z-10">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Secure Payment Methods</div>
          <div className="flex justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2">
              <CreditCard size={20} />
              <span className="text-[10px] font-bold">CARD</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet size={20} />
              <span className="text-[10px] font-bold">PAYPAL</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins size={20} />
              <span className="text-[10px] font-bold">CRYPTO</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
            By donating, you agree to our terms of service. Donations are non-refundable.<br />
            Thank you for being part of the community!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Zap = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const Sparkles = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);
