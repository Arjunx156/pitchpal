import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '../../src/features/theme/ThemeProvider';
import { FanContextProvider } from '../../src/features/context/ContextProvider';
import { SpeechProvider } from '../../src/features/voice/SpeechProvider';
import { ChatProvider } from '../../src/features/chat/ChatProvider';

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <FanContextProvider>
        <SpeechProvider>
          <ChatProvider>{children}</ChatProvider>
        </SpeechProvider>
      </FanContextProvider>
    </ThemeProvider>
  );
}

/** Render a component with all PitchPal providers (theme, context, speech, chat). */
export function renderWithProviders(ui: ReactElement) {
  return render(<AllProviders>{ui}</AllProviders>);
}

/** Skip the first-run onboarding modal in tests. */
export function markOnboarded() {
  localStorage.setItem('pitchpal.onboarded', '1');
}
