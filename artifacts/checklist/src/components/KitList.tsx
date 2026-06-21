import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronRight, Trash2, BarChart2, Crown } from 'lucide-react';
import { useChecklistStore } from '../store/useChecklistStore';
import { usePremiumStore } from '../store/usePremiumStore';

interface KitListProps {
  onShowAnalytics: () => void;
}

export function KitList({ onShowAnalytics }: KitListProps) {
  const { kits, setActiveKit, createKit, deleteKit, updateKitName } = useChecklistStore();
  const { isPremium, activatePremium } = usePremiumStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newKitName, setNewKitName] = useState('');
  const newKitInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && newKitInputRef.current) {
      newKitInputRef.current.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKitName.trim()) {
      createKit(newKitName.trim());
      setNewKitName('');
      setIsCreating(false);
    } else {
      setIsCreating(false);
    }
  };

  const handleEditSubmit = (id: string) => {
    if (editName.trim()) {
      updateKitName(id, editName.trim());
    }
    setEditingId(null);
  };

  const startEdit = (id: string, currentName: string) => {
    setEditName(currentName);
    setEditingId(id);
  };

  const handleInsightsClick = () => {
    if (isPremium) {
      onShowAnalytics();
    } else {
      activatePremium();
      onShowAnalytics();
    }
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
              isPremium
                ? 'text-foreground hover:bg-accent'
                : 'text-muted-foreground/60 hover:text-foreground hover:bg-accent'
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
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="bg-card border border-primary/40 rounded-xl p-4 flex items-center"
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
          </form>
        )}

        {kits.length === 0 && !isCreating ? (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
            <div>
              <p className="font-bold text-lg mb-2">No kits yet.</p>
              <p>Tap + to create one.</p>
            </div>
          </div>
        ) : (
          kits.map((kit) => (
            <div
              key={kit.id}
              className="group bg-card border border-border rounded-xl p-4 flex items-center justify-between touch-manipulation relative overflow-hidden"
              data-testid={`kit-card-${kit.id}`}
            >
              <div
                className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                onClick={() => setActiveKit(kit.id)}
              >
                {editingId === kit.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleEditSubmit(kit.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit(kit.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-input px-2 py-1 rounded text-foreground font-bold text-lg focus:outline-none"
                    data-testid={`edit-kit-${kit.id}`}
                  />
                ) : (
                  <>
                    <h2
                      className="text-lg font-bold truncate"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        startEdit(kit.id, kit.name);
                      }}
                    >
                      {kit.name}
                    </h2>
                    <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full shrink-0">
                      {kit.items.filter((i) => i.checked).length}/{kit.items.length}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteKit(kit.id);
                  }}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-colors"
                  data-testid={`delete-kit-${kit.id}`}
                  aria-label="Delete kit"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveKit(kit.id)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Open kit"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Pro promo strip — only when not premium */}
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
