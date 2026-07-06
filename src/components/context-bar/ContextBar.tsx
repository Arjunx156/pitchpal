import { useFanContext } from '../../features/context/ContextProvider';
import {
  ACCESSIBILITY_PROFILES,
  LANGUAGES,
  type AccessibilityProfile,
  type LanguageCode,
} from '../../features/context/types';
import { LANGUAGE_NAMES } from '../../i18n/ui';

export function ContextBar() {
  const { context, ui, update } = useFanContext();

  return (
    <aside className="context-bar" aria-label={ui.settingsHeading}>
      <h2 className="context-bar__heading">{ui.settingsHeading}</h2>

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
    </aside>
  );
}
