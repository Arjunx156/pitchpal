import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Download } from 'lucide-react';
import { useFanContext } from '../../features/context/ContextProvider';
import { useInstallPrompt } from '../../features/pwa/useInstallPrompt';
import { ContextBar } from '../context-bar/ContextBar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { OpsHud } from '../ops/OpsHud';
import { CrowdAnalytics } from '../analytics/CrowdAnalytics';
import { Standings } from '../standings/Standings';

interface MoreSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MoreSheet({ open, onClose }: MoreSheetProps) {
  const { ui } = useFanContext();
  const { canInstall, promptInstall } = useInstallPrompt();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="more-sheet__overlay" />
        <DialogPrimitive.Content className="more-sheet__content" aria-describedby={undefined}>
          <span className="more-sheet__grabber" aria-hidden="true" />
          <DialogPrimitive.Title className="more-sheet__title display">{ui.nav.more}</DialogPrimitive.Title>

          <div className="more-sheet__section">
            <ThemeToggle ui={ui} />
            {canInstall ? (
              <button type="button" className="btn-secondary" onClick={() => void promptInstall()}>
                <Download size={16} aria-hidden="true" />
                <span>{ui.install}</span>
              </button>
            ) : null}
          </div>

          {/* idPrefix keeps ids unique — these components are also mounted in the desktop rails. */}
          <div className="more-sheet__section">
            <ContextBar idPrefix="sheet-" />
          </div>
          <div className="more-sheet__section">
            <OpsHud idPrefix="sheet-" />
          </div>
          <div className="more-sheet__section">
            <CrowdAnalytics idPrefix="sheet-" />
          </div>
          <div className="more-sheet__section">
            <Standings idPrefix="sheet-" />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
