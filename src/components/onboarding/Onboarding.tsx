import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useFanContext } from '../../features/context/ContextProvider';
import {
  ACCESSIBILITY_PROFILES,
  LANGUAGES,
  type AccessibilityProfile,
  type LanguageCode,
} from '../../features/context/types';
import { fmt } from '../../i18n/answers';
import { LANGUAGE_NAMES } from '../../i18n/ui';

const TOTAL = 3;

export function Onboarding({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { context, ui, update } = useFanContext();
  const [step, setStep] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setStep(0);
      const id = requestAnimationFrame(() => panelRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [open]);

  if (!open) return null;

  const stepTitles = [ui.onboarding.stepLanguage, ui.onboarding.stepAccess, ui.onboarding.stepSeat];
  const isLast = step === TOTAL - 1;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    // Focus trap: keep Tab cycling inside the dialog while it is modal.
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="onb-overlay"
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="onb"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onb-title"
        tabIndex={-1}
        ref={panelRef}
      >
        <p className="onb__step">{fmt(ui.onboarding.step, { n: step + 1, total: TOTAL })}</p>
        <h2 id="onb-title" className="onb__title display">
          {step === 0 ? ui.onboarding.title : stepTitles[step]}
        </h2>
        {step === 0 ? <p className="onb__subtitle">{ui.onboarding.subtitle}</p> : null}

        <div className="onb__body">
          {step === 0 ? (
            <fieldset className="onb__field">
              <legend>{ui.onboarding.stepLanguage}</legend>
              <div className="onb__radios">
                {LANGUAGES.map((code) => (
                  <label key={code} className="onb__radio">
                    <input
                      type="radio"
                      name="onb-language"
                      checked={context.language === code}
                      onChange={() => update({ language: code as LanguageCode })}
                    />
                    <span>{LANGUAGE_NAMES[code]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {step === 1 ? (
            <fieldset className="onb__field">
              <legend>{ui.accessibilityLabel}</legend>
              <div className="onb__radios">
                {ACCESSIBILITY_PROFILES.map((profile) => (
                  <label key={profile} className="onb__radio">
                    <input
                      type="radio"
                      name="onb-access"
                      checked={context.accessibility === profile}
                      onChange={() => update({ accessibility: profile as AccessibilityProfile })}
                    />
                    <span>{ui.accessibility[profile]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {step === 2 ? (
            <div className="onb__field">
              <label htmlFor="onb-location">{ui.locationLabel}</label>
              <input
                id="onb-location"
                type="text"
                className="onb__input"
                value={context.location}
                maxLength={120}
                placeholder={ui.locationPlaceholder}
                onChange={(e) => update({ location: e.target.value })}
              />
            </div>
          ) : null}
        </div>

        <div className="onb__actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            {ui.onboarding.skip}
          </button>
          <div className="onb__nav">
            {step > 0 ? (
              <button type="button" className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
                {ui.onboarding.back}
              </button>
            ) : null}
            <button
              type="button"
              className="btn-primary"
              onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
            >
              {isLast ? ui.onboarding.finish : ui.onboarding.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
