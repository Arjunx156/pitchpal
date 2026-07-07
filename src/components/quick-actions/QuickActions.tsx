import { motion } from 'framer-motion';
import { Accessibility, Armchair, HeartPulse, LogOut, Toilet, Utensils } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChatContext } from '../../features/chat/ChatProvider';
import { QUICK_ACTION_KEYS, type QuickActionKey } from '../../i18n/ui';

const ICONS: Record<QuickActionKey, LucideIcon> = {
  seat: Armchair,
  food: Utensils,
  restroom: Toilet,
  accessible: Accessibility,
  leave: LogOut,
  firstAid: HeartPulse,
};

export function QuickActions() {
  const { ui } = useFanContext();
  const { send, isStreaming } = useChatContext();

  return (
    <div className="quick-actions" role="group" aria-label={ui.quickActions.heading}>
      <p className="quick-actions__heading">{ui.quickActions.heading}</p>
      <ul className="quick-actions__list">
        {QUICK_ACTION_KEYS.map((key) => {
          const action = ui.quickActions[key];
          const Icon = ICONS[key];
          return (
            <li key={key}>
              <motion.button
                type="button"
                className="chip-btn"
                disabled={isStreaming}
                onClick={() => void send(action.query)}
                whileHover={isStreaming ? undefined : { scale: 1.03 }}
                whileTap={isStreaming ? undefined : { scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              >
                <Icon size={16} aria-hidden="true" />
                {action.label}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
