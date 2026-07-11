import { motion } from 'framer-motion';
import {
  Accessibility,
  Armchair,
  HeartPulse,
  LogOut,
  Trophy,
  UtensilsCrossed,
  Droplets,
} from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import type { QuickAction } from '../../i18n/ui';
import { rowItem } from '../../lib/motion';
import { Panel } from '../ui/Panel';

const ACTION_ICON = {
  seat: Armchair,
  food: UtensilsCrossed,
  restroom: Droplets,
  accessible: Accessibility,
  leave: LogOut,
  firstAid: HeartPulse,
  score: Trophy,
} as const;

type ActionKey = keyof typeof ACTION_ICON;

export function QuickActions({ onAsk }: { onAsk: (query: string) => void }) {
  const { ui } = useFanContext();
  const keys: ActionKey[] = [
    'seat',
    'food',
    'restroom',
    'accessible',
    'firstAid',
    'leave',
    'score',
  ];

  return (
    <Panel eyebrow={ui.composerLabel} heading={ui.quickActions.heading}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {keys.map((key) => {
          const action = ui.quickActions[key] as QuickAction;
          const Icon = ACTION_ICON[key];
          return (
            <motion.button
              key={key}
              type="button"
              variants={rowItem}
              onClick={() => onAsk(action.query)}
              className="group flex items-center gap-2.5 rounded-lg border border-border bg-[color-mix(in_oklab,var(--color-surface)_50%,transparent)] px-3 py-2.5 text-left transition-all hover:-translate-y-px hover:border-[color-mix(in_oklab,var(--color-accent)_45%,transparent)] hover:shadow-1"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface-2 text-accent transition-colors group-hover:bg-[color-mix(in_oklab,var(--color-accent)_16%,transparent)]">
                <Icon size={15} aria-hidden />
              </span>
              <span className="truncate text-sm font-medium text-foreground">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    </Panel>
  );
}
