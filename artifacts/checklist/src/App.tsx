import { useState, useEffect } from 'react';
import { useChecklistStore } from './store/useChecklistStore';
import { KitList } from './components/KitList';
import { KitDetail } from './components/KitDetail';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AnimatePresence } from 'framer-motion';

function App() {
  const activeKitId = useChecklistStore((state) => state.activeKitId);
  const hasBeenSeeded = useChecklistStore((state) => state.hasBeenSeeded);
  const seedDefaultKits = useChecklistStore((state) => state.seedDefaultKits);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (!hasBeenSeeded) {
      seedDefaultKits();
    }
  }, [hasBeenSeeded, seedDefaultKits]);

  return (
    <div className="min-h-[100dvh] w-full bg-background overflow-hidden relative">
      <KitList onShowAnalytics={() => setShowAnalytics(true)} />

      <AnimatePresence>
        {activeKitId && <KitDetail key="detail" />}
      </AnimatePresence>

      <AnimatePresence>
        {showAnalytics && (
          <AnalyticsDashboard
            key="analytics"
            onClose={() => setShowAnalytics(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
