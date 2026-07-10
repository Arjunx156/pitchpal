import { AnimatePresence, motion } from 'framer-motion';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type Theme } from '../../features/theme/ThemeProvider';
import type { UiStrings } from '../../i18n/ui';
import { cn } from '../../lib/utils';

const ICON = { system: Monitor, light: Sun, dark: Moon } as const;

/** Cycles system → light → dark; the icon crossfades on each press. */
export function ThemeToggle({ ui, className }: { ui: UiStrings; className?: string }) {
  const { theme, cycle } = useTheme();
  const Icon = ICON[theme];
  const label = ui.theme[theme as Theme];

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`${ui.theme.label}: ${label}`}
      title={`${ui.theme.label}: ${label}`}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full text-muted-foreground',
        'transition-colors hover:bg-surface-2 hover:text-foreground active:scale-95',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="grid place-items-center"
        >
          <Icon size={17} aria-hidden />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
