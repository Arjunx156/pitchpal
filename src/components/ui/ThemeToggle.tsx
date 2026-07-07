import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type Theme } from '../../features/theme/ThemeProvider';
import type { UiStrings } from '../../i18n/ui';

const ICONS: Record<Theme, typeof Monitor> = { system: Monitor, light: Sun, dark: Moon };

export function ThemeToggle({ ui }: { ui: UiStrings }) {
  const { theme, cycle } = useTheme();
  const labels: Record<Theme, string> = {
    system: ui.theme.system,
    light: ui.theme.light,
    dark: ui.theme.dark,
  };
  const Icon = ICONS[theme];

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={cycle}
      aria-label={`${ui.theme.label}: ${labels[theme]}`}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
