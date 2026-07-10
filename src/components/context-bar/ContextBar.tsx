import { type ReactNode } from 'react';
import { Accessibility, Globe, MapPin, Trophy } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import {
  ACCESSIBILITY_PROFILES,
  LANGUAGES,
  type AccessibilityProfile,
  type LanguageCode,
} from '../../features/context/types';
import { LANGUAGE_NAMES } from '../../i18n/ui';
import { FIXTURES } from '../../features/tournament/fixture';
import { Panel } from '../ui/Panel';

const fieldCls =
  'w-full appearance-none rounded-lg border border-border bg-[color-mix(in_oklab,var(--color-surface)_60%,transparent)] py-2 pl-9 pr-8 text-sm text-foreground transition-colors hover:border-border-strong focus:border-[color-mix(in_oklab,var(--color-accent)_60%,transparent)] focus:outline-none';

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="hud-eyebrow mb-1 block">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        {children}
      </span>
    </label>
  );
}

/** The fan's context — language, accessibility, match, location — that the
 *  assistant reasons over. Every change updates the shared context immediately. */
export function ContextBar() {
  const { ui, context, update } = useFanContext();

  return (
    <Panel eyebrow="Your context" heading={ui.settingsHeading}>
      <div className="flex flex-col gap-3">
        <Field icon={<Globe size={15} aria-hidden />} label={ui.languageLabel}>
          <select
            className={fieldCls}
            value={context.language}
            onChange={(e) => update({ language: e.target.value as LanguageCode })}
          >
            {LANGUAGES.map((code) => (
              <option key={code} value={code}>
                {LANGUAGE_NAMES[code]}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<Accessibility size={15} aria-hidden />} label={ui.accessibilityLabel}>
          <select
            className={fieldCls}
            value={context.accessibility}
            onChange={(e) => update({ accessibility: e.target.value as AccessibilityProfile })}
          >
            {ACCESSIBILITY_PROFILES.map((profile) => (
              <option key={profile} value={profile}>
                {ui.accessibility[profile]}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<Trophy size={15} aria-hidden />} label={ui.matchLabel}>
          <select
            className={fieldCls}
            value={context.matchId}
            onChange={(e) => update({ matchId: e.target.value })}
          >
            {FIXTURES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.home.code} v {f.away.code} · {f.group}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<MapPin size={15} aria-hidden />} label={ui.locationLabel}>
          <input
            type="text"
            className={fieldCls.replace('pr-8', 'pr-3')}
            value={context.location}
            placeholder={ui.locationPlaceholder}
            maxLength={120}
            onChange={(e) => update({ location: e.target.value })}
          />
        </Field>
      </div>
    </Panel>
  );
}
