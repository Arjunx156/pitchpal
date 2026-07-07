import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import { useChatContext } from '../../features/chat/ChatProvider';
import { useTheme } from '../../features/theme/ThemeProvider';
import { useSpeech } from '../../features/voice/SpeechProvider';
import { LANGUAGES } from '../../features/context/types';
import { LANGUAGE_NAMES, QUICK_ACTION_KEYS } from '../../i18n/ui';

interface Action {
  id: string;
  group: string;
  label: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onFocusMap: () => void;
}

export function CommandPalette({ open, onClose, onFocusMap }: CommandPaletteProps) {
  const { ui, update } = useFanContext();
  const { send } = useChatContext();
  const { cycle } = useTheme();
  const { output, toggleAutoRead } = useSpeech();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [open]);

  const actions = useMemo<Action[]>(() => {
    const close = onClose;
    const ask: Action[] = QUICK_ACTION_KEYS.map((k) => ({
      id: `ask-${k}`,
      group: ui.commandPalette.groupAsk,
      label: ui.quickActions[k].label,
      run: () => {
        void send(ui.quickActions[k].query);
        close();
      },
    }));
    const settings: Action[] = [
      { id: 'theme', group: ui.commandPalette.groupSettings, label: ui.commandPalette.toggleTheme, run: () => { cycle(); close(); } },
      { id: 'map', group: ui.commandPalette.groupSettings, label: ui.commandPalette.focusMap, run: () => { onFocusMap(); close(); } },
    ];
    if (output.supported) {
      settings.push({
        id: 'read',
        group: ui.commandPalette.groupSettings,
        label: ui.commandPalette.toggleReadAloud,
        run: () => { toggleAutoRead(); close(); },
      });
    }
    const langs: Action[] = LANGUAGES.map((code) => ({
      id: `lang-${code}`,
      group: ui.languageLabel,
      label: LANGUAGE_NAMES[code],
      run: () => { update({ language: code }); close(); },
    }));
    return [...ask, ...settings, ...langs];
  }, [ui, send, cycle, onFocusMap, output.supported, toggleAutoRead, update, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q));
  }, [actions, query]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[active]?.run();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label={ui.commandPalette.open}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="palette__search">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="palette__input"
            value={query}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={filtered[active] ? `palette-opt-${active}` : undefined}
            placeholder={ui.commandPalette.placeholder}
            aria-label={ui.commandPalette.placeholder}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
        </div>
        <ul id="palette-list" className="palette__list" role="listbox" aria-label={ui.commandPalette.open}>
          {filtered.length === 0 ? (
            <li className="palette__empty">{ui.commandPalette.empty}</li>
          ) : (
            filtered.map((a, i) => (
              <li
                key={a.id}
                id={`palette-opt-${i}`}
                role="option"
                aria-selected={i === active}
                className={`palette__item${i === active ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => a.run()}
              >
                <span className="palette__item-label">{a.label}</span>
                <span className="palette__item-group">{a.group}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
