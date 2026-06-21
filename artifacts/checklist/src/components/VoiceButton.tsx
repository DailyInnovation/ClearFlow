import { useState, useEffect } from 'react';
import { Mic, MicOff, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceToTask } from '../hooks/useVoiceToTask';
import { useChecklistStore } from '../store/useChecklistStore';

interface VoiceButtonProps {
  kitId: string;
}

export function VoiceButton({ kitId }: VoiceButtonProps) {
  const { isListening, transcript, error, isSupported, startListening, stopListening, clearTranscript, parseIntoItems } = useVoiceToTask();
  const { addItem } = useChecklistStore();
  const [parsedItems, setParsedItems] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (transcript) {
      const items = parseIntoItems(transcript);
      setParsedItems(items);
      setShowPreview(true);
    }
  }, [transcript, parseIntoItems]);

  const handleConfirm = () => {
    parsedItems.forEach((text) => {
      if (text.trim()) addItem(kitId, text.trim());
    });
    clearTranscript();
    setParsedItems([]);
    setShowPreview(false);
  };

  const handleDiscard = () => {
    clearTranscript();
    setParsedItems([]);
    setShowPreview(false);
  };

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handleToggle}
          disabled={!isSupported}
          className={`p-2 rounded-md transition-colors relative ${
            isListening
              ? 'text-primary bg-primary/10'
              : 'text-foreground hover:bg-accent'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          data-testid="voice-record-button"
          aria-label={isListening ? 'Stop recording' : 'Start voice input'}
          title={!isSupported ? 'Voice input not supported in this browser' : undefined}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
          {isListening && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {showPreview && parsedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center p-4"
            onClick={handleDiscard}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Add {parsedItems.length} item{parsedItems.length !== 1 ? 's' : ''} from voice?</h3>
                <button
                  onClick={handleDiscard}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="voice-discard-button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ul className="flex flex-col gap-2 mb-5 max-h-60 overflow-y-auto">
                {parsedItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 bg-muted px-4 py-2.5 rounded-lg text-sm font-medium text-foreground"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={handleDiscard}
                  className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-bold hover:bg-accent transition-colors"
                  data-testid="voice-cancel-button"
                >
                  Discard
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  data-testid="voice-confirm-button"
                >
                  <Plus className="w-4 h-4" />
                  Add All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-sm font-medium px-4 py-2 rounded-lg shadow-lg z-40 max-w-xs text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
