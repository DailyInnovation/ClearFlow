import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Trash2, BarChart2, Crown, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChecklistStore } from '../store/useChecklistStore';
import { usePremiumStore } from '../store/usePremiumStore';
import { ItemRow } from './ItemRow';

interface KitListProps {
  onShowAnalytics: () => void;
}

export function KitList({ onShowAnalytics }: KitListProps) {
  const { kits, createKit, deleteKit, updateKitName, addItem, resetKit } = useChecklistStore();
  const { isPremium, activatePremium } = usePremiumStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newKitName, setNewKitName] = useState('');
  const newKitInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Per-kit inline add-item input
  const [addingToKitId, setAddingToKitId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const addItemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && newKitInputRef.current) newKitInputRef.current.focus();
  }, [isCreating]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  useEffect(() => {
    if (addingToKitId && addItemInputRef.current) addItemInputRef.current.focus();
  }, [addingToKitId]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKitName.trim()) {
      createKit(newKitName.trim());
      setNewKitName('');
    }
    setIsCreating(false);
  };

  const handleEditSubmit = (id: string) => {
    if (editName.trim()) updateKitName(id, editName.trim());
    setEditingId(null);
  };

  const handleAddItem = (e: React.FormEvent, kitId: string) => {
    e.preventDefault();
    if (newItemText.trim()) {
      addItem(kitId, newItemText.trim());
      setNewItemText('');
      setTimeout(() => addItemInputRef.current?.focus(), 10);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setAddingToKitId(null);
    setNewItemText('');
  };

  const handleInsightsClick = () => {
    if (!isPremium) activatePremium();
    onShowAnalytics();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-2xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Focus Kit</h1>
          {isPremium && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary mt-0.5">
              <Crown className="w-3 h-3" />
              Pro
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInsightsClick}
            className={`p-2 rounded-lg transition-colors relative ${
              isPremium ? 'text-foreground hover:bg-accent' : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent'
            }`}
            data-testid="insights-button"
            aria-label="View insights"
          >
            <BarChart2 className="w-5 h-5" />
            {!isPremium && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-primary-foreground" />
              </span>
            )}
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition-opacity"
            data-testid="create-kit-button"
            aria-label="Create new kit"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Kit List */}
      <main className="flex-1 p-4 flex flex-col gap-3">
        {/* New kit inline form */}
        <AnimatePresence>
          {isCreating && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateSubmit}
              className="bg-card border border-primary/40 rounded-xl px-4 py-3 flex items-center overflow-hidden"
            >
              <input
                ref={newKitInputRef}
                type="text"
                value={newKitName}
                onChange={(e) => setNewKitName(e.target.value)}
                onBlur={handleCreateSubmit}
                placeholder="Kit name..."
                className="flex-1 bg-transparent text-foreground font-bold text-lg focus:outline-none"
                data-testid="new-kit-input"
              />
            </motion.form>
          )}
        </AnimatePresence>

        {kits.length === 0 && !isCreating ? (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground py-24">
            <div>
              <p className="font-bold text-lg mb-2">No kits yet.</p>
              <p>Tap + to create one.</p>
            </div>
          </div>
        ) : (
          kits.map((kit) => {
            const isExpanded = expandedId === kit.id;
            const doneCount = kit.items.filter((i) => i.checked).length;
            const totalCount = kit.items.length;
            const allDone = totalCount > 0 && doneCount === totalCount;

            return (
              <div
                key={kit.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
                data-testid={`kit-card-${kit.id}`}
              >
                {/* Kit Header Row */}
                <div className="flex items-center px-4 py-3.5 gap-2">
                  {/* Expand toggle — takes most of the row */}
                  <button
                    className="flex-1 flex items-center gap-3 min-w-0 text-left"
                    onClick={() => toggleExpand(kit.id)}
                    data-testid={`expand-kit-${kit.id}`}
                    aria-expanded={isExpanded}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-muted-foreground"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>

                    {editingId === kit.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleEditSubmit(kit.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit(kit.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-input px-2 py-0.5 rounded text-foreground font-bold text-base focus:outline-none"
                        data-testid={`edit-kit-${kit.id}`}
                      />
                    ) : (
                      <h2
                        className="text-base font-bold truncate flex-1"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setEditName(kit.name);
                          setEditingId(kit.id);
                        }}
                      >
                        {kit.name}
                      </h2>
                    )}

                    {/* Progress badge */}
                    <span
                      className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                        allDone
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {allDone ? <Check className="w-3.5 h-3.5 inline" /> : `${doneCount}/${totalCount}`}
                    </span>
                  </button>

                  {/* Reset */}
                  <button
                    onClick={(e) => { e.stopPropagation(); resetKit(kit.id); }}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    data-testid={`reset-kit-${kit.id}`}
                    aria-label="Reset kit"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteKit(kit.id); }}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-colors"
                    data-testid={`delete-kit-${kit.id}`}
                    aria-label="Delete kit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded items panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="expanded"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden border-t border-border"
                    >
                      {kit.items.length === 0 ? (
                        <p className="px-5 py-4 text-sm text-muted-foreground">
                          No items yet. Add one below.
                        </p>
                      ) : (
                        <AnimatePresence initial={false}>
                          {kit.items.map((item) => (
                            <ItemRow key={item.id} kitId={kit.id} item={item} />
                          ))}
                        </AnimatePresence>
                      )}

                      {/* Inline add-item */}
                      <div className="px-4 py-3 border-t border-border bg-background/60">
                        {addingToKitId === kit.id ? (
                          <form
                            onSubmit={(e) => handleAddItem(e, kit.id)}
                            className="flex gap-2"
                          >
                            <input
                              ref={addItemInputRef}
                              type="text"
                              value={newItemText}
                              onChange={(e) => setNewItemText(e.target.value)}
                              onBlur={() => {
                                if (!newItemText.trim()) {
                                  setAddingToKitId(null);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  setAddingToKitId(null);
                                  setNewItemText('');
                                }
                              }}
                              placeholder="New item..."
                              className="flex-1 bg-input border border-border text-foreground font-semibold px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              data-testid={`inline-add-input-${kit.id}`}
                            />
                            <button
                              type="submit"
                              disabled={!newItemText.trim()}
                              className="bg-primary text-primary-foreground font-bold px-3 py-2 rounded-lg disabled:opacity-50 flex items-center"
                              data-testid={`inline-add-submit-${kit.id}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setAddingToKitId(kit.id);
                              setNewItemText('');
                            }}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                            data-testid={`show-add-item-${kit.id}`}
                          >
                            <Plus className="w-4 h-4" />
                            Add item
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </main>

      {/* Pro promo strip */}
      {!isPremium && (
        <div className="m-4 bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold text-sm text-foreground">Unlock Pro features</p>
            <p className="text-xs text-muted-foreground mt-0.5">Voice-to-Task + Insights dashboard</p>
          </div>
          <button
            onClick={activatePremium}
            className="shrink-0 flex items-center gap-1.5 bg-primary text-primary-foreground font-bold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            data-testid="upgrade-strip-button"
          >
            <Crown className="w-3.5 h-3.5" />
            Try Pro
          </button>
        </div>
      )}
    </div>
  );
}
