import { motion } from 'framer-motion';
import { Accessibility, LogOut, Navigation, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SuggestedAction, SuggestionKind } from '../../features/suggestions/suggestNextActions';
import type { UiStrings } from '../../i18n/ui';

const SUGGESTION_ICONS: Record<SuggestionKind, LucideIcon> = {
  amenity: Sparkles,
  reroute: Navigation,
  leave: LogOut,
  accessible: Accessibility,
};

export function suggestionLabel(kind: SuggestionKind, ui: UiStrings): string {
  if (kind === 'reroute') return ui.risk.rerouteCta;
  if (kind === 'accessible') return ui.quickActions.accessible.label;
  if (kind === 'leave') return ui.quickActions.leave.label;
  return ui.quickActions.food.label;
}

interface SuggestionChipProps {
  suggestion: SuggestedAction;
  ui: UiStrings;
  disabled: boolean;
  onRun: (query: string) => void;
}

/** One rendering of a smart suggestion — label + reason microcopy — shared by
 *  the dashboard tile and the chat quick-action strip so they never drift. */
export function SuggestionChip({ suggestion, ui, disabled, onRun }: SuggestionChipProps) {
  const Icon = SUGGESTION_ICONS[suggestion.kind];
  return (
    <motion.button
      type="button"
      className="chip-btn chip-btn--suggested"
      disabled={disabled}
      onClick={() => onRun(suggestion.query)}
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
    >
      <Icon size={16} aria-hidden="true" />
      <span>
        {suggestionLabel(suggestion.kind, ui)}
        <span className="chip-btn__reason">{suggestion.reason}</span>
      </span>
    </motion.button>
  );
}
