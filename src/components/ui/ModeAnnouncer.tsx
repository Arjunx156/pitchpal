import { useChatContext } from '../../features/chat/ChatProvider';
import { useFanContext } from '../../features/context/ContextProvider';
import { fmt } from '../../i18n/answers';
import { LiveRegion } from './LiveRegion';

/**
 * Announces assistant mode changes (Live AI / Demo / Offline) to screen
 * readers. The visual ModeBadge only lives inside the chat header, so without
 * this a non-sighted fan never learns the assistant dropped to offline answers.
 */
export function ModeAnnouncer() {
  const { mode } = useChatContext();
  const { ui } = useFanContext();
  const labels = {
    live: ui.modeLive,
    mock: ui.modeMock,
    offline: ui.offline.badge,
  } as const;
  const message = mode === 'unknown' ? '' : fmt(ui.modeAnnouncement, { mode: labels[mode] });
  return <LiveRegion message={message} />;
}
