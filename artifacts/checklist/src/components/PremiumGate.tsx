import { usePremiumStore } from '../store/usePremiumStore';
import { Crown, Lock } from 'lucide-react';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
}

export function PremiumGate({ children, feature, description }: PremiumGateProps) {
  const { isPremium, activatePremium } = usePremiumStore();

  if (isPremium) return <>{children}</>;

  return (
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
        onClick={activatePremium}
        className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
        data-testid="activate-premium-button"
      >
        <Crown className="w-5 h-5" />
        Activate Pro (Demo)
      </button>
      <p className="text-xs text-muted-foreground">
        Simulates a Lemon Squeezy subscription gate.
      </p>
    </div>
  );
}
