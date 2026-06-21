import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Kit, Item } from "../types";

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
    (set) => ({
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
                  items: [...kit.items, { id: generateId(), text, checked: false }],
                }
              : kit
          ),
        })),
      deleteItem: (kitId, itemId) =>
        set((state) => ({
          kits: state.kits.map((kit) =>
            kit.id === kitId
              ? {
                  ...kit,
                  items: kit.items.filter((item) => item.id !== itemId),
                }
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
      toggleItem: (kitId, itemId) =>
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
        })),
      resetKit: (kitId) =>
        set((state) => ({
          kits: state.kits.map((kit) =>
            kit.id === kitId
              ? {
                  ...kit,
                  items: kit.items.map((item) => ({ ...item, checked: false })),
                }
              : kit
          ),
        })),
    }),
    {
      name: "contextual-checklist-v1",
    }
  )
);
