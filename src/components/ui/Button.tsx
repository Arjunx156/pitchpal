import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * Broadcast control. Gold is the signature action; glass and ghost stay quiet
 * so the one gold button per view carries the weight. Press feedback is a
 * compositor-only scale, safe under reduced-motion (transition is near-instant).
 */
const button = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold ' +
    'transition-[transform,background-color,color,box-shadow] duration-fast ease-out ' +
    'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-on-accent shadow-[var(--glow-gold)] hover:bg-accent-strong hover:-translate-y-px',
        secondary:
          'glass text-foreground hover:border-[color-mix(in_oklab,var(--color-text)_20%,transparent)]',
        ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
        danger:
          'bg-[color-mix(in_oklab,var(--color-danger)_16%,transparent)] text-[var(--color-danger)] ' +
          'border border-[color-mix(in_oklab,var(--color-danger)_40%,transparent)] hover:bg-[color-mix(in_oklab,var(--color-danger)_24%,transparent)]',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, type = 'button', ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cn(button({ variant, size }), className)} {...props} />
  );
});
