import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type LegalView = 'terms' | 'privacy' | null;

interface LegalModalProps {
  view: LegalView;
  onClose: () => void;
}

const TERMS = `Terms of Use

Last updated: June 2026

1. Acceptance
By using Focus Kit ("the App") you agree to these terms. If you do not agree, do not use the App.

2. Use of the App
Focus Kit is a personal productivity tool. You may use it for lawful, personal purposes only. You must not misuse, reverse-engineer, or attempt to disrupt the App.

3. Pro Features
Pro features are available via a one-time purchase through Gumroad. Purchases are subject to Gumroad's own terms and refund policies. Activating Pro on a device is tied to that device's local storage.

4. No Warranties
The App is provided "as is" without any warranties, express or implied. We do not guarantee uptime, accuracy, or fitness for a particular purpose.

5. Limitation of Liability
To the fullest extent permitted by law, Daily Innovation shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.

6. Changes
We may update these terms at any time. Continued use of the App after changes constitutes acceptance.

7. Contact
Questions? Email us at daily.innovation12@gmail.com`;

const PRIVACY = `Privacy Policy

Last updated: June 2026

1. Overview
Focus Kit is a client-side application. All checklist data is stored exclusively in your browser's local storage and IndexedDB. No data is transmitted to any server.

2. Data We Collect
We do not collect, store, or process any personal data on our servers. Your checklists, completion history, and Pro status exist only on your device.

3. Voice Input (Pro)
When you use the Voice-to-Task feature, speech is processed entirely by your browser's built-in Speech Recognition API. Audio is never sent to our servers.

4. Analytics (Pro)
All usage analytics (completion rates, missed items) are computed and stored locally in your browser's IndexedDB. This data never leaves your device.

5. Third-Party Services
Purchases are handled by Gumroad. Please review Gumroad's privacy policy at gumroad.com for information on how they handle payment data.

6. Cookies
The App does not use cookies. All persistence is via the Web Storage API (localStorage / IndexedDB).

7. Children
The App is not directed at children under 13.

8. Changes
We may update this policy at any time. The "Last updated" date at the top reflects the most recent revision.

9. Contact
Questions? Email us at daily.innovation12@gmail.com`;

export function LegalModal({ view, onClose }: LegalModalProps) {
  const title = view === 'terms' ? 'Terms of Use' : 'Privacy Policy';
  const content = view === 'terms' ? TERMS : PRIVACY;

  return (
    <AnimatePresence>
      {view && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-full sm:max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="font-bold text-foreground text-lg">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {content}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
