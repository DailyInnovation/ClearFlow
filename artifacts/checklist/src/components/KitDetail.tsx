import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff, Plus, RotateCcw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChecklistStore } from "../store/useChecklistStore";
import { ItemRow } from "./ItemRow";

export function KitDetail() {
  const { activeKitId, kits, setActiveKit, resetKit, addItem, updateKitName } = useChecklistStore();
  const kit = kits.find((k) => k.id === activeKitId);
  const [ghostMode, setGhostMode] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(kit?.name || "");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  if (!kit) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim() && activeKitId) {
      addItem(activeKitId, newItemText.trim());
      setNewItemText("");
      // Keep focus on input for fast entry
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleNameSubmit = () => {
    if (editName.trim() && activeKitId) {
      updateKitName(activeKitId, editName.trim());
    } else {
      setEditName(kit.name); // Reset if empty
    }
    setIsEditingName(false);
  };

  const totalItems = kit.items.length;
  const doneItems = kit.items.filter((i) => i.checked).length;
  const visibleItems = ghostMode ? kit.items.filter((i) => !i.checked) : kit.items;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 bg-background flex flex-col z-10"
    >
      <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center flex-1 min-w-0 mr-4">
          <button
            onClick={() => setActiveKit(null)}
            className="p-2 mr-2 text-foreground hover:bg-accent rounded-md transition-colors"
            data-testid="back-button"
            aria-label="Back to kits"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="flex-1 bg-input text-foreground font-bold text-lg p-1 rounded min-w-0"
              data-testid="edit-kit-name-input"
            />
          ) : (
            <div className="flex flex-col min-w-0">
              <h1 
                className="text-lg font-bold text-foreground truncate cursor-pointer"
                onClick={() => setIsEditingName(true)}
                data-testid="kit-name-display"
              >
                {kit.name}
              </h1>
              <span className="text-xs font-semibold text-muted-foreground">
                {doneItems} / {totalItems} done
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setGhostMode(!ghostMode)}
              className={`p-2 rounded-md transition-colors ${
                ghostMode ? "text-primary bg-primary/10" : "text-foreground hover:bg-accent"
              }`}
              data-testid="toggle-ghost-mode"
              aria-label="Toggle ghost mode"
            >
              {ghostMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {ghostMode && doneItems > 0 && (
              <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {doneItems}
              </span>
            )}
          </div>
          
          <button
            onClick={() => activeKitId && resetKit(activeKitId)}
            className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"
            data-testid="reset-kit-button"
            aria-label="Reset kit"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-safe">
        {kit.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
            <p className="font-bold mb-2">This kit is empty.</p>
            <p className="text-sm">Add items below to get started.</p>
          </div>
        ) : visibleItems.length === 0 && ghostMode ? (
          <div className="flex flex-col items-center justify-center h-full text-primary p-8 text-center">
            <Check className="w-12 h-12 mb-4" />
            <p className="font-bold text-lg">All items completed.</p>
          </div>
        ) : (
          <div className="pb-24">
            <AnimatePresence initial={false}>
              {visibleItems.map((item) => (
                <ItemRow key={item.id} kitId={kit.id} item={item} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-sm border-t border-border pb-safe">
        <form onSubmit={handleAddItem} className="flex gap-2 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add an item..."
            className="flex-1 bg-input border border-border text-foreground font-bold px-4 py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            data-testid="new-item-input"
          />
          <button
            type="submit"
            disabled={!newItemText.trim()}
            className="bg-primary text-primary-foreground font-bold px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            data-testid="add-item-button"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
