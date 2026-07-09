import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Semantic colors map onto the CSS variables defined in src/styles/tokens.css,
 * so light/dark/system theming is driven entirely by those variables (no `dark:`
 * variants needed). Tailwind's default palette is kept for opacity utilities.
 */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // shadcn-standard names (so Magic/shadcn components drop in)
        background: 'var(--color-bg)',
        foreground: 'var(--color-text)',
        card: 'var(--color-surface)',
        'card-foreground': 'var(--color-text)',
        popover: 'var(--color-elevated)',
        'popover-foreground': 'var(--color-text)',
        primary: 'var(--color-accent)',
        'primary-foreground': 'var(--color-on-accent)',
        secondary: 'var(--color-surface-2)',
        'secondary-foreground': 'var(--color-text)',
        muted: 'var(--color-surface-2)',
        'muted-foreground': 'var(--color-text-muted)',
        accent: 'var(--color-surface-2)',
        'accent-foreground': 'var(--color-text)',
        destructive: 'var(--color-danger)',
        'destructive-foreground': 'var(--color-on-accent)',
        border: 'var(--color-border)',
        input: 'var(--color-border)',
        ring: 'var(--color-focus)',
        // Match Day brand tokens
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        elevated: 'var(--color-elevated)',
        'border-strong': 'var(--color-border-strong)',
        brand: 'var(--color-accent)',
        'brand-strong': 'var(--color-accent-strong)',
        pitch: 'var(--color-pitch)',
        'pitch-bright': 'var(--color-pitch-bright)',
        live: 'var(--color-live)',
        warn: 'var(--color-warn)',
        ok: 'var(--color-ok)',
        busy: 'var(--color-busy)',
        jam: 'var(--color-jam)',
        // Broadcast Editorial: glass surfaces
        glass: 'var(--color-glass-surface-1)',
        'glass-2': 'var(--color-glass-surface-2)',
        'glass-border': 'var(--color-glass-border)',
        scrim: 'var(--color-scrim)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        sans: 'var(--font-sans)',
      },
      fontSize: {
        '2xs': 'var(--text-2xs)',
        hero: 'var(--score-hero-size)',
      },
      letterSpacing: {
        tight: 'var(--tracking-tight)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        xl: 'calc(var(--radius-lg) + 6px)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
        3: 'var(--shadow-3)',
        glow: 'var(--glow-gold)',
        'risk-jam': 'var(--risk-glow-jam)',
      },
      spacing: {
        'bento-lg': 'var(--space-12)',
        'bento-xl': 'var(--space-16)',
      },
      backdropBlur: {
        glass: 'var(--blur-glass)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        spring: 'var(--ease-spring)',
        emphasized: 'var(--ease-emphasized)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        hero: 'var(--duration-hero)',
      },
      zIndex: {
        nav: 'var(--z-nav)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
