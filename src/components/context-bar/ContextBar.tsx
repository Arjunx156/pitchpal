import { motion } from 'framer-motion';
import { useFanContext } from '../../features/context/ContextProvider';
import {
  ACCESSIBILITY_PROFILES,
  LANGUAGES,
  type AccessibilityProfile,
  type LanguageCode,
} from '../../features/context/types';
import { FIXTURES } from '../../features/tournament/fixture';
import { LANGUAGE_NAMES } from '../../i18n/ui';
import { panelItem } from '../../lib/motion';

export function ContextBar() {
  const { context, ui, update } = useFanContext();

  return (
    <motion.section className="context-bar" aria-labelledby="context-heading" variants={panelItem}>
      <h2 id="context-heading" className="context-bar__heading">
        {ui.settingsHeading}
      </h2>

      <div className="field">
        <label htmlFor="ctx-match">{ui.matchLabel}</label>
        <select
          id="ctx-match"
          value={context.matchId}
          onChange={(e) => update({ matchId: e.target.value })}
        >
          {FIXTURES.map((f) => (
            <option key={f.id} value={f.id}>
              {f.home.code} vs {f.away.code}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="ctx-language">{ui.languageLabel}</label>
        <select
          id="ctx-language"
          value={context.language}
          onChange={(e) => update({ language: e.target.value as LanguageCode })}
        >
          {LANGUAGES.map((code) => (
            <option key={code} value={code}>
              {LANGUAGE_NAMES[code]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="ctx-access">{ui.accessibilityLabel}</label>
        <select
          id="ctx-access"
          value={context.accessibility}
          onChange={(e) => update({ accessibility: e.target.value as AccessibilityProfile })}
        >
          {ACCESSIBILITY_PROFILES.map((profile) => (
            <option key={profile} value={profile}>
              {ui.accessibility[profile]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="ctx-location">{ui.locationLabel}</label>
        <input
          id="ctx-location"
          type="text"
          value={context.location}
          maxLength={120}
          placeholder={ui.locationPlaceholder}
          onChange={(e) => update({ location: e.target.value })}
        />
      </div>
    </motion.section>
  );
}
