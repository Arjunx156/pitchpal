import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
} from 'react';
import {
  Armchair,
  Download,
  Languages,
  MapPin,
  Moon,
  Search,
  Trophy,
  Utensils,
  Volume2,
} from 'lucide-react';
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
  /** Present only when the browser offers PWA install — adds an install command. */
  onInstall?: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onFocusMap,
  onAsk,
  onInstall,
}: CommandPaletteProps) {
  const { ui, context, update } = useFanContext();
  const { cycle } = useTheme();
  const { toggleAutoRead } = useSpeech();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Fresh palette on every open: no stale filter or highlight.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

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
    const list: Command[] = [
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
    if (onInstall) {
      list.push({
        id: 'install',
        group: ui.commandPalette.groupSettings,
        icon: Download,
        label: ui.install,
        run: () => {
          onInstall();
          onClose();
        },
      });
    }
    return list;
  }, [ui, context.language, onAsk, onClose, onFocusMap, onInstall, cycle, toggleAutoRead, update]);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const groups = [...new Set(filtered.map((c) => c.group))];
  // Keyboard order must mirror the grouped render order.
  const ordered = groups.flatMap((group) => filtered.filter((c) => c.group === group));
  const active = Math.min(activeIndex, Math.max(0, ordered.length - 1));
  const activeCommand = ordered[active];

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (ordered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((active + 1) % ordered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((active - 1 + ordered.length) % ordered.length);
    } else if (e.key === 'Enter' && activeCommand) {
      e.preventDefault();
      activeCommand.run();
    }
  };

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
            role="combobox"
            aria-label={ui.commandPalette.open}
            aria-expanded="true"
            aria-controls="palette-options"
            aria-activedescendant={activeCommand ? `palette-opt-${activeCommand.id}` : undefined}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder={ui.commandPalette.placeholder}
            className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="tabular rounded border border-border px-1.5 py-0.5 text-[0.6rem] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div
          ref={listRef}
          id="palette-options"
          role="listbox"
          aria-label={ui.commandPalette.open}
          className="max-h-[52vh] overflow-y-auto"
        >
          {ordered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {ui.commandPalette.empty}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group} role="group" aria-label={group} className="mb-1">
                <p aria-hidden className="hud-eyebrow px-3 py-1.5">
                  {group}
                </p>
                {filtered
                  .filter((c) => c.group === group)
                  .map((c) => {
                    const Icon = c.icon;
                    const isActive = activeCommand?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        id={`palette-opt-${c.id}`}
                        role="option"
                        aria-selected={isActive}
                        onClick={c.run}
                        onMouseMove={() => setActiveIndex(ordered.indexOf(c))}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors',
                          isActive && 'bg-surface-2',
                        )}
                      >
                        <Icon size={16} />
                        <span className="flex-1">{c.label}</span>
                      </div>
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
