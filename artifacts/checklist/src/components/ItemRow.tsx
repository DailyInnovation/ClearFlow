import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { Item } from "../types";
import { useChecklistStore } from "../store/useChecklistStore";

interface ItemRowProps {
  kitId: string;
  item: Item;
}

export function ItemRow({ kitId, item }: ItemRowProps) {
  const toggleItem = useChecklistStore((state) => state.toggleItem);
  const deleteItem = useChecklistStore((state) => state.deleteItem);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
      className="group flex items-center justify-between p-4 border-b border-border bg-background touch-manipulation"
      data-testid={`item-row-${item.id}`}
    >
      <div
        className="flex items-center flex-1 min-w-0 cursor-pointer"
        onClick={() => toggleItem(kitId, item.id)}
        data-testid={`toggle-item-${item.id}`}
      >
        <motion.div
          animate={item.checked ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.15, type: "spring", stiffness: 300 }}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
            item.checked
              ? "bg-primary border-primary"
              : "border-muted-foreground bg-transparent"
          }`}
        >
          {item.checked && <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />}
        </motion.div>
        
        <span
          className={`text-base sm:text-lg font-bold truncate transition-all duration-200 ${
            item.checked ? "text-primary line-through" : "text-foreground"
          }`}
        >
          {item.text}
        </span>
      </div>

      <button
        onClick={() => deleteItem(kitId, item.id)}
        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-muted ml-2 focus:outline-none focus:ring-2 focus:ring-destructive"
        data-testid={`delete-item-${item.id}`}
        aria-label="Delete item"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
