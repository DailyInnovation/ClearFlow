import { useChecklistStore } from "./store/useChecklistStore";
import { KitList } from "./components/KitList";
import { KitDetail } from "./components/KitDetail";
import { AnimatePresence } from "framer-motion";

function App() {
  const activeKitId = useChecklistStore((state) => state.activeKitId);

  return (
    <div className="min-h-[100dvh] w-full bg-background overflow-hidden relative">
      <KitList />
      <AnimatePresence>
        {activeKitId && <KitDetail key="detail" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
