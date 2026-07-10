import { type ReactNode } from 'react';
import * as RD from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { dialogIn, overlayIn } from '../../lib/motion';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Hide the visible title row (title still announced to screen readers). */
  hideHeader?: boolean;
  closeLabel?: string;
  /** 'center' modal or 'sheet' sliding from the bottom (mobile-friendly). */
  variant?: 'center' | 'sheet';
  className?: string;
  children: ReactNode;
}

/**
 * Animated modal built on Radix (focus trap, ESC, scroll lock, ARIA) with a
 * broadcast glass skin and framer entrance. forceMount + AnimatePresence lets
 * the exit animation play before Radix unmounts.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  hideHeader = false,
  closeLabel = 'Close',
  variant = 'center',
  className,
  children,
}: DialogProps) {
  return (
    <RD.Root open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <AnimatePresence>
        {open ? (
          <RD.Portal forceMount>
            <RD.Overlay asChild forceMount>
              <motion.div
                variants={overlayIn}
                initial="hidden"
                animate="show"
                exit="exit"
                className="fixed inset-0 z-[var(--z-overlay)] bg-scrim backdrop-blur-[2px]"
              />
            </RD.Overlay>
            <RD.Content
              asChild
              forceMount
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="fixed z-[var(--z-modal)]"
            >
              <motion.div
                variants={dialogIn}
                initial="hidden"
                animate="show"
                exit="exit"
                className={cn(
                  'glass scanlines fixed left-1/2 -translate-x-1/2 overflow-hidden shadow-3',
                  variant === 'center'
                    ? 'top-1/2 w-[min(92vw,540px)] -translate-y-1/2 rounded-2xl'
                    : 'bottom-0 w-full max-w-[640px] rounded-t-2xl sm:bottom-6 sm:rounded-2xl',
                  className,
                )}
              >
                <span aria-hidden className="brand-rule absolute inset-x-0 top-0" />
                <div className="p-5 sm:p-6">
                  <div className={cn('flex items-start justify-between gap-4', hideHeader && 'sr-only')}>
                    <div>
                      <RD.Title className="display text-xl text-foreground">{title}</RD.Title>
                      {description ? (
                        <RD.Description className="mt-1 text-sm text-muted-foreground">
                          {description}
                        </RD.Description>
                      ) : null}
                    </div>
                  </div>
                  {!hideHeader && description === undefined ? null : null}
                  <div className={cn(!hideHeader && 'mt-4')}>{children}</div>
                </div>
                <RD.Close
                  aria-label={closeLabel}
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  <X size={18} aria-hidden />
                </RD.Close>
              </motion.div>
            </RD.Content>
          </RD.Portal>
        ) : null}
      </AnimatePresence>
    </RD.Root>
  );
}
