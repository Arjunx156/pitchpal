import { useMemo, useState, type ComponentType } from 'react';
import { Armchair, Languages, MapPin, Moon, Search, Trophy, Utensils, Volume2 } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import { useTheme } from '../../features/theme/ThemeProvider';
import { useSpeech } from '../../features/voice/SpeechProvider';
import { LANGUAGES, type LanguageCode } from '../../features/context/types';
import { LANGUAGE_NAMES } from '../../i18n/ui';
import { Dialog } from '../ui/Dialog';
import { cn } from '../../lib/utils';

interface Command {
  id: string;
  label: string;
  group: string;
  icon: ComponentType<{ size?: number | string }>;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onFocusMap: () => void;
  onAsk: (query: string) => void;
}

export function CommandPalette({ open, onClose, onFocusMap, onAsk }: CommandPaletteProps) {
  const { ui, context, update } = useFanContext();
  const { cycle } = useTheme();
  const { toggleAutoRead } = useSpeech();
  const [query, setQuery] = useState('');

  const commands = useMemo<Command[]>(() => {
    const ask = (q: string) => () => {
      onAsk(q);
      onClose();
    };
    const nextLanguage = () => {
      const i = LANGUAGES.indexOf(context.language);
      const next = LANGUAGES[(i + 1) % LANGUAGES.length] as LanguageCode;
      update({ language: next });
    };
    return [
      {
        id: 'seat',
        group: ui.commandPalette.groupAsk,
        icon: Armchair,
        label: ui.quickActions.seat.label,
        run: ask(ui.quickActions.seat.query),
      },
      {
        id: 'food',
        group: ui.commandPalette.groupAsk,
        icon: Utensils,
        label: ui.quickActions.food.label,
        run: ask(ui.quickActions.food.query),
      },
      {
        id: 'score',
        group: ui.commandPalette.groupAsk,
        icon: Trophy,
        label: ui.quickActions.score.label,
        run: ask(ui.quickActions.score.query),
      },
      {
        id: 'map',
        group: ui.commandPalette.groupSettings,
        icon: MapPin,
        label: ui.commandPalette.focusMap,
        run: () => {
          onFocusMap();
          onClose();
        },
      },
      {
        id: 'lang',
        group: ui.commandPalette.groupSettings,
        icon: Languages,
        label: `${ui.commandPalette.changeLanguage} · ${LANGUAGE_NAMES[context.language]}`,
        run: nextLanguage,
      },
      {
        id: 'theme',
        group: ui.commandPalette.groupSettings,
        icon: Moon,
        label: ui.commandPalette.toggleTheme,
        run: cycle,
      },
      {
        id: 'read',
        group: ui.commandPalette.groupSettings,
        icon: Volume2,
        label: ui.commandPalette.toggleReadAloud,
        run: toggleAutoRead,
      },
    ];
  }, [ui, context.language, onAsk, onClose, onFocusMap, cycle, toggleAutoRead, update]);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const groups = [...new Set(filtered.map((c) => c.group))];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={ui.commandPalette.open}
      hideHeader
      closeLabel={ui.stop}
    >
      <div className="-m-1">
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] px-3">
          <Search size={16} aria-hidden className="text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtered[0]) {
                e.preventDefault();
                filtered[0].run();
              }
            }}
            placeholder={ui.commandPalette.placeholder}
            className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="tabular rounded border border-border px-1.5 py-0.5 text-[0.6rem] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {ui.commandPalette.empty}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group} className="mb-1">
                <p className="hud-eyebrow px-3 py-1.5">{group}</p>
                {filtered
                  .filter((c) => c.group === group)
                  .map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={c.run}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground',
                          'transition-colors hover:bg-surface-2',
                        )}
                      >
                        <Icon size={16} />
                        <span className="flex-1">{c.label}</span>
                      </button>
                    );
                  })}
              </div>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
}
