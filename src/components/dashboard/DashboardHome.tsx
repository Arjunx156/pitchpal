import { motion } from 'framer-motion';
import { staggerContainer } from '../../lib/motion';
import { GateRiskPanel } from './GateRiskPanel';
import { NextUp } from './NextUp';
import { SuggestedActions } from './SuggestedActions';
import { QuickActions } from './QuickActions';

interface DashboardHomeProps {
  onAsk: (query: string) => void;
  onOpenItinerary: () => void;
}

/**
 * The match-day rundown. A broadcast bento: live gate-risk read and the fan's
 * next steps up top, then what to ask next. The persistent scoreboard already
 * carries the score, so home stays a control room rather than repeating it.
 */
export function DashboardHome({ onAsk, onOpenItinerary }: DashboardHomeProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-3 lg:grid-cols-3"
    >
      <div className="lg:col-span-2">
        <GateRiskPanel onAsk={onAsk} />
      </div>
      <NextUp onOpenItinerary={onOpenItinerary} />
      <SuggestedActions onAsk={onAsk} />
      <div className="lg:col-span-2">
        <QuickActions onAsk={onAsk} />
      </div>
    </motion.div>
  );
}
