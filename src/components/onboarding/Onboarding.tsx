import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import {
  ACCESSIBILITY_PROFILES,
  LANGUAGES,
  type AccessibilityProfile,
  type LanguageCode,
} from '../../features/context/types';
import { LANGUAGE_NAMES } from '../../i18n/ui';
import { fmt } from '../../i18n/answers';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { FIELD_SURFACE } from '../../lib/variants';

const TOTAL = 3;

export function Onboarding({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { ui, context, update } = useFanContext();
  const [step, setStep] = useState(0);

  const titles = [ui.onboarding.stepLanguage, ui.onboarding.stepAccess, ui.onboarding.stepSeat];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={ui.onboarding.title}
      description={ui.onboarding.subtitle}
    >
      <div className="mt-2">
        {/* progress dots */}
        <div className="mb-4 flex items-center gap-1.5" aria-hidden>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i <= step ? 'bg-accent' : 'bg-surface-2',
              )}
            />
          ))}
        </div>
        <p className="hud-eyebrow mb-3">
          {fmt(ui.onboarding.step, { n: step + 1, total: TOTAL })} · {titles[step]}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="min-h-[168px]"
          >
            {step === 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((code) => (
                  <SelectTile
                    key={code}
                    label={LANGUAGE_NAMES[code]}
                    active={context.language === code}
                    onClick={() => update({ language: code as LanguageCode })}
                  />
                ))}
              </div>
            ) : step === 1 ? (
              <div className="flex flex-col gap-2">
                {ACCESSIBILITY_PROFILES.map((profile) => (
                  <SelectTile
                    key={profile}
                    label={ui.accessibility[profile]}
                    active={context.accessibility === profile}
                    onClick={() => update({ accessibility: profile as AccessibilityProfile })}
                  />
                ))}
              </div>
            ) : (
              <div>
                <label className="hud-eyebrow mb-1 block" htmlFor="ob-location">
                  {ui.locationLabel}
                </label>
                <input
                  id="ob-location"
                  type="text"
                  value={context.location}
                  placeholder={ui.locationPlaceholder}
                  maxLength={120}
                  onChange={(e) => update({ location: e.target.value })}
                  className={cn(
                    FIELD_SURFACE,
                    'w-full px-3 py-2.5 placeholder:text-muted-foreground',
                  )}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {ui.onboarding.skip}
          </button>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                {ui.onboarding.back}
              </Button>
            ) : null}
            {step < TOTAL - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>{ui.onboarding.next}</Button>
            ) : (
              <Button onClick={onClose}>{ui.onboarding.finish}</Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function SelectTile({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors',
        active
          ? 'border-transparent bg-[color-mix(in_oklab,var(--color-accent)_16%,transparent)] text-foreground ring-1 ring-[color-mix(in_oklab,var(--color-accent)_50%,transparent)]'
          : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
      )}
    >
      {label}
      {active ? <Check size={15} className="text-accent" aria-hidden /> : null}
    </button>
  );
}
