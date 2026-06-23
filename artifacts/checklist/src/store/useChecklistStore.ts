import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Kit, Item } from '../types';
import { logEvent } from '../lib/analyticsDB';

const DEFAULT_KITS: Kit[] = [
  {
    id: 'default-leaving-home',
    name: 'Leaving Home',
    items: [
      { id: 'lh-1', text: 'Keys', checked: false },
      { id: 'lh-2', text: 'Phone', checked: false },
      { id: 'lh-3', text: 'Wallet', checked: false },
      { id: 'lh-4', text: 'Charger', checked: false },
      { id: 'lh-5', text: 'Water bottle', checked: false },
      { id: 'lh-6', text: 'Headphones', checked: false },
      { id: 'lh-7', text: 'Bag', checked: false },
    ],
  },
  {
    id: 'default-morning',
    name: 'Morning Routine',
    items: [
      { id: 'mr-1', text: 'Alarm off', checked: false },
      { id: 'mr-2', text: 'Shower', checked: false },
      { id: 'mr-3', text: 'Brush teeth', checked: false },
      { id: 'mr-4', text: 'Get dressed', checked: false },
      { id: 'mr-5', text: 'Breakfast', checked: false },
      { id: 'mr-6', text: 'Medication', checked: false },
    ],
  },
  {
    id: 'default-work-bag',
    name: 'Work Bag',
    items: [
      { id: 'wb-1', text: 'Laptop', checked: false },
      { id: 'wb-2', text: 'Charger', checked: false },
      { id: 'wb-3', text: 'ID / pass', checked: false },
      { id: 'wb-4', text: 'Notebook', checked: false },
      { id: 'wb-5', text: 'Headphones', checked: false },
      { id: 'wb-6', text: 'Water bottle', checked: false },
    ],
  },
  {
    id: 'default-grocery',
    name: 'Grocery Run',
    items: [
      { id: 'gr-1', text: 'Wallet / card', checked: false },
      { id: 'gr-2', text: 'Shopping bags', checked: false },
      { id: 'gr-3', text: 'Shopping list', checked: false },
      { id: 'gr-4', text: 'Phone', checked: false },
    ],
  },
  {
    id: 'default-travel',
    name: 'Travel / Trip',
    items: [
      { id: 'tr-1', text: 'Passport / ID', checked: false },
      { id: 'tr-2', text: 'Tickets / boarding pass', checked: false },
      { id: 'tr-3', text: 'Phone + charger', checked: false },
      { id: 'tr-4', text: 'Headphones', checked: false },
      { id: 'tr-5', text: 'Medication', checked: false },
      { id: 'tr-6', text: 'Change of clothes', checked: false },
      { id: 'tr-7', text: 'Toothbrush + toiletries', checked: false },
      { id: 'tr-8', text: 'Cash + cards', checked: false },
    ],
  },
];

interface ChecklistState {
  kits: Kit[];
  activeKitId: string | null;
  hasBeenSeeded: boolean;
  seedDefaultKits: () => void;
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
      hasBeenSeeded: false,

      seedDefaultKits: () => {
        set({ kits: DEFAULT_KITS, hasBeenSeeded: true });
      },

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
          kits: state.kits.map((k) =>
            k.id === kitId
              ? {
                  ...k,
                  items: k.items.map((i) =>
                    i.id === itemId ? { ...i, checked: !i.checked } : i
                  ),
                }
              : k
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
          kits: state.kits.map((k) =>
            k.id === kitId
              ? { ...k, items: k.items.map((i) => ({ ...i, checked: false })) }
              : k
          ),
        }));
      },
    }),
    {
      name: 'contextual-checklist-v1',
    }
  )
);
