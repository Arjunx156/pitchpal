import { motion } from 'framer-motion';
import { LayoutGrid, ListChecks, Map as MapIcon, MessagesSquare, MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';

export type Surface = 'home' | 'chat' | 'map' | 'itinerary';

interface BottomNavProps {
  surface: Surface;
  onChange: (surface: Surface) => void;
  onMore: () => void;
}

const ITEMS: { surface: Surface; icon: LucideIcon }[] = [
  { surface: 'home', icon: LayoutGrid },
  { surface: 'chat', icon: MessagesSquare },
  { surface: 'map', icon: MapIcon },
  { surface: 'itinerary', icon: ListChecks },
];

export function BottomNav({ surface, onChange, onMore }: BottomNavProps) {
  const { ui } = useFanContext();

  return (
    <nav className="bottom-nav" aria-label={ui.nav.heading}>
      {ITEMS.map(({ surface: itemSurface, icon: Icon }) => {
        const isActive = surface === itemSurface;
        return (
          <button
            key={itemSurface}
            type="button"
            className={`bottom-nav__btn${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(itemSurface)}
          >
            {isActive ? (
              <motion.span layoutId="bottomnav-pill" className="bottom-nav__pill" aria-hidden="true" />
            ) : null}
            <span className="bottom-nav__icon">
              <Icon size={20} aria-hidden="true" />
            </span>
            {ui.nav[itemSurface]}
          </button>
        );
      })}
      <button type="button" className="bottom-nav__btn" onClick={onMore}>
        <span className="bottom-nav__icon">
          <MoreHorizontal size={20} aria-hidden="true" />
        </span>
        {ui.nav.more}
      </button>
    </nav>
  );
}
