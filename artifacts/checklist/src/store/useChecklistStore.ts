import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Kit, Item } from '../types';
import { logEvent } from '../lib/analyticsDB';

interface ChecklistState {
  kits: Kit[];
  activeKitId: string | null;
  createKit: (name: string) => void;
  deleteKit: (id: string) => void;
  updateKitName: (id: string, name: string) => void;
  setActiveKit: (id: string | null) => void;
  addItem: (kitId: string, text: string) => void;
  deleteItem: (kitId: string, itemId: string) => void;
  updateItemText: (kitId: string, itemId: string, text: string) => void;
  toggleItem: (kitId: string, itemId: string) => void;
  resetKit: (kitId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set, get) => ({
      kits: [],
      activeKitId: null,
      createKit: (name) =>
        set((state) => ({
          kits: [...state.kits, { id: generateId(), name, items: [] }],
        })),
      deleteKit: (id) =>
        set((state) => ({
          kits: state.kits.filter((kit) => kit.id !== id),
          activeKitId: state.activeKitId === id ? null : state.activeKitId,
        })),
      updateKitName: (id, name) =>
        set((state) => ({
          kits: state.kits.map((kit) =>
            kit.id === id ? { ...kit, name } : kit
          ),
        })),
      setActiveKit: (id) => set({ activeKitId: id }),
      addItem: (kitId, text) =>
        set((state) => ({
          kits: state.kits.map((kit) =>
            kit.id === kitId
              ? {
                  ...kit,
                  items: [
                    ...kit.items,
                    { id: generateId(), text, checked: false } as Item,
                  ],
                }
              : kit
          ),
        })),
      deleteItem: (kitId, itemId) =>
        set((state) => ({
          kits: state.kits.map((kit) =>
            kit.id === kitId
              ? { ...kit, items: kit.items.filter((item) => item.id !== itemId) }
              : kit
          ),
        })),
      updateItemText: (kitId, itemId, text) =>
        set((state) => ({
          kits: state.kits.map((kit) =>
            kit.id === kitId
              ? {
                  ...kit,
                  items: kit.items.map((item) =>
                    item.id === itemId ? { ...item, text } : item
                  ),
                }
              : kit
          ),
        })),
      toggleItem: (kitId, itemId) => {
        const { kits } = get();
        const kit = kits.find((k) => k.id === kitId);
        const item = kit?.items.find((i) => i.id === itemId);
        if (kit && item && !item.checked) {
          void logEvent({
            type: 'check',
            kitId,
            kitName: kit.name,
            itemId,
            itemText: item.text,
            timestamp: Date.now(),
          });
        }
        set((state) => ({
          kits: state.kits.map((kit) =>
            kit.id === kitId
              ? {
                  ...kit,
                  items: kit.items.map((item) =>
                    item.id === itemId ? { ...item, checked: !item.checked } : item
                  ),
                }
              : kit
          ),
        }));
      },
      resetKit: (kitId) => {
        const { kits } = get();
        const kit = kits.find((k) => k.id === kitId);
        if (kit && kit.items.length > 0) {
          const checkedCount = kit.items.filter((i) => i.checked).length;
          const unchecked = kit.items.filter((i) => !i.checked);
          const now = Date.now();
          void logEvent({
            type: 'reset_session',
            kitId,
            kitName: kit.name,
            totalItems: kit.items.length,
            checkedItems: checkedCount,
            timestamp: now,
          });
          unchecked.forEach((item) => {
            void logEvent({
              type: 'miss',
              kitId,
              kitName: kit.name,
              itemId: item.id,
              itemText: item.text,
              timestamp: now,
            });
          });
        }
        set((state) => ({
          kits: state.kits.map((kit) =>
            kit.id === kitId
              ? {
                  ...kit,
                  items: kit.items.map((item) => ({ ...item, checked: false })),
                }
              : kit
          ),
        }));
      },
    }),
    { name: 'contextual-checklist-v1' }
  )
);
