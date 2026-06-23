import { useState } from 'react';
import { Lock } from 'lucide-react';
import { PaywallModal } from './PaywallModal';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
}

export function PremiumGate({ children, feature, description }: PremiumGateProps) {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#334155] flex items-center justify-center">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">{feature}</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            {description ?? 'Upgrade to Pro to unlock this feature.'}
          </p>
        </div>
        <button
          onClick={() => setShowPaywall(true)}
          className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          data-testid="gate-upgrade-button"
        >
          Get Pro
        </button>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      {children}
    </>
  );
}
