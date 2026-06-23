import { useState } from 'react';
import { X, Mic, BarChart2, TrendingUp, Target, Crown, ExternalLink, Key, CheckCircle, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePremiumStore } from '../store/usePremiumStore';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUMROAD_URL = 'https://dailyinnovation.gumroad.com/l/bjtysz';

const FEATURES = [
  {
    icon: <Mic className="w-5 h-5" />,
    title: 'Voice-to-Task',
    description: 'Say your checklist out loud. The app parses your speech and adds every item in one tap — no typing needed.',
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: 'Insights Dashboard',
    description: 'Track completion rates over time, spot your top missed items, and build streaks with a Consistency Score.',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Completion Trends',
    description: 'Area chart of your daily completion rate across all kits so you can see what days you nail it.',
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: 'Consistency Score',
    description: 'A single number that tells you how reliably you complete your kits before resetting. ADHD accountability, simplified.',
  },
];

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { activatePremium } = usePremiumStore();
  const [showKeyField, setShowKeyField] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [keyError, setKeyError] = useState('');
  const [activated, setActivated] = useState(false);

  const handleBuy = () => {
    window.open(GUMROAD_URL, '_blank', 'noopener,noreferrer');
  };

  const [isVerifying, setIsVerifying] = useState(false);

  const handleActivateKey = async () => {
    const trimmed = licenseKey.trim();
    if (!trimmed) {
      setKeyError('Please enter your license key.');
      return;
    }
    setKeyError('');
    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: trimmed }),
      });
      const data = (await res.json()) as { success: boolean; message?: string };
      if (!data.success) {
        setKeyError(data.message ?? 'Invalid license key.');
        return;
      }
      setActivated(true);
      setTimeout(() => {
        activatePremium();
        onClose();
        setActivated(false);
        setLicenseKey('');
        setShowKeyField(false);
      }, 900);
    } catch {
      setKeyError('Could not reach the license server. Check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    onClose();
    setShowKeyField(false);
    setLicenseKey('');
    setKeyError('');
    setActivated(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-full sm:max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#0f1a12] to-[#0A0A0A] px-6 pt-8 pb-6 border-b border-border">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
                data-testid="paywall-close"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Focus Kit</p>
                  <h2 className="text-2xl font-bold text-foreground leading-tight">Go Pro</h2>
                </div>
              </div>
              <p className="text-muted-foreground text-sm max-w-sm">
                Unlock voice input and analytics — built for brains that need to move fast and stay on track.
              </p>
            </div>

            {/* Features */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{f.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-6 pb-8 pt-2 flex flex-col gap-3">
              <button
                onClick={handleBuy}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-base"
                data-testid="paywall-buy-button"
              >
                Get Pro — Buy on Gumroad
                <ExternalLink className="w-4 h-4" />
              </button>

              {/* License key section */}
              <div className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => { setShowKeyField((v) => !v); setKeyError(''); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  data-testid="paywall-toggle-key"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Key className="w-4 h-4" />
                    I already have a license key
                  </span>
                  <motion.div animate={{ rotate: showKeyField ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {showKeyField && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="px-4 py-3 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={licenseKey}
                            onChange={(e) => { setLicenseKey(e.target.value); setKeyError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleActivateKey()}
                            placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                            className="flex-1 bg-background border border-border text-foreground font-mono text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
                            data-testid="license-key-input"
                            autoComplete="off"
                            spellCheck={false}
                          />
                          <button
                            onClick={handleActivateKey}
                            disabled={!licenseKey.trim() || isVerifying || activated}
                            className="shrink-0 flex items-center gap-1.5 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[90px] justify-center"
                            data-testid="activate-key-button"
                          >
                            {activated ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : isVerifying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Activate'
                            )}
                          </button>
                        </div>
                        {keyError && (
                          <p className="text-xs text-destructive font-medium px-1" data-testid="key-error">
                            {keyError}
                          </p>
                        )}
                        {activated && (
                          <p className="text-xs text-primary font-bold px-1">
                            Key accepted — activating Pro...
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
