import { motion } from 'framer-motion';
import { Accessibility, Clock, MapPin, Navigation, Repeat, Train, Utensils } from 'lucide-react';
import type { AnswerCard } from '../../lib/cards';
import type { UiStrings } from '../../i18n/ui';
import { fmt } from '../../i18n/answers';
import { rowItem, staggerContainer } from '../../lib/motion';

/** A small broadcast "lower-third" wrapper shared by every card type. */
function CardShell({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Navigation;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="glass relative mt-2 overflow-hidden rounded-lg pl-3.5"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-accent" />
      <div className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[color-mix(in_oklab,var(--color-accent)_16%,transparent)] text-accent">
            <Icon size={15} aria-hidden />
          </span>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

function AccessBadge({ ok, ui, kind }: { ok?: boolean; ui: UiStrings; kind: 'step' | 'access' }) {
  if (ok === undefined) return null;
  if (kind === 'access' && !ok) return null;
  const label =
    kind === 'step' ? (ok ? ui.card.stepFree : ui.card.notStepFree) : ui.card.accessible;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.62rem] font-semibold"
      style={{
        color: ok ? 'var(--color-ok)' : 'var(--color-text-muted)',
        background: ok
          ? 'color-mix(in oklab, var(--color-ok) 14%, transparent)'
          : 'var(--color-surface-2)',
      }}
    >
      <Accessibility size={11} aria-hidden />
      {label}
    </span>
  );
}

export function CardRenderer({ card, ui }: { card: AnswerCard; ui: UiStrings }) {
  if (card.type === 'route') {
    return (
      <CardShell icon={Navigation} title={card.title}>
        {card.fromLabel || card.toLabel ? (
          <p className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={12} aria-hidden className="text-accent" />
            {card.fromLabel ? <span>{card.fromLabel}</span> : null}
            {card.fromLabel && card.toLabel ? <span aria-hidden>→</span> : null}
            {card.toLabel ? (
              <span className="font-medium text-foreground">{card.toLabel}</span>
            ) : null}
          </p>
        ) : null}
        <div className="mb-2 flex flex-wrap gap-1.5">
          {card.etaMinutes !== undefined ? (
            <span className="chip tabular text-foreground">
              <Clock size={11} aria-hidden />
              {fmt(ui.card.walk, { min: card.etaMinutes })}
            </span>
          ) : null}
          <AccessBadge ok={card.stepFree} ui={ui} kind="step" />
        </div>
        <ol className="relative flex flex-col gap-2 pl-1">
          {card.steps.map((step, i) => (
            <motion.li
              key={i}
              variants={rowItem}
              className="flex items-start gap-2.5 text-sm text-foreground"
            >
              <span className="tabular mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-2 text-[0.65rem] font-bold text-accent">
                {i + 1}
              </span>
              <span>{step}</span>
            </motion.li>
          ))}
        </ol>
      </CardShell>
    );
  }

  if (card.type === 'amenity') {
    return (
      <CardShell icon={Utensils} title={card.title}>
        <ul className="flex flex-col gap-2">
          {card.items.map((item, i) => (
            <motion.li
              key={i}
              variants={rowItem}
              className="flex items-start justify-between gap-3 border-b border-[color-mix(in_oklab,var(--color-border)_60%,transparent)] pb-2 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                {item.detail ? (
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {item.hours ? (
                  <span className="tabular text-[0.62rem] text-muted-foreground">{item.hours}</span>
                ) : null}
                <AccessBadge ok={item.stepFree} ui={ui} kind="step" />
              </div>
            </motion.li>
          ))}
        </ul>
      </CardShell>
    );
  }

  return (
    <CardShell icon={Train} title={card.title}>
      <ul className="flex flex-col gap-2">
        {card.options.map((opt, i) => (
          <motion.li
            key={i}
            variants={rowItem}
            className="flex items-start justify-between gap-3 border-b border-[color-mix(in_oklab,var(--color-border)_60%,transparent)] pb-2 last:border-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{opt.name}</p>
              {opt.detail ? <p className="text-xs text-muted-foreground">{opt.detail}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {opt.frequency ? (
                <span className="inline-flex items-center gap-1 text-[0.62rem] text-muted-foreground">
                  <Repeat size={10} aria-hidden />
                  {opt.frequency}
                </span>
              ) : null}
              <AccessBadge ok={opt.accessible} ui={ui} kind="access" />
            </div>
          </motion.li>
        ))}
      </ul>
    </CardShell>
  );
}
