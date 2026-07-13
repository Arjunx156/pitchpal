import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Scoreboard } from '../../src/components/scoreboard/Scoreboard';
import { DashboardHome } from '../../src/components/dashboard/DashboardHome';
import { ChatWindow } from '../../src/components/chat/ChatWindow';
import { StadiumMap } from '../../src/components/map/StadiumMap';
import { OpsHud } from '../../src/components/ops/OpsHud';
import { ContextBar } from '../../src/components/context-bar/ContextBar';
import { Composer } from '../../src/components/chat/Composer';
import { CommandPalette } from '../../src/components/command/CommandPalette';
import { Onboarding } from '../../src/components/onboarding/Onboarding';
import { ItineraryPanel } from '../../src/components/itinerary/ItineraryPanel';
import { Standings } from '../../src/components/standings/Standings';
import { renderWithProviders } from '../helpers/render';

expect.extend(toHaveNoViolations);

const noop = () => {};

describe('Accessibility (jest-axe)', () => {
  it('Scoreboard has no violations', async () => {
    const { container } = renderWithProviders(<Scoreboard />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('DashboardHome has no violations', async () => {
    const { container } = renderWithProviders(
      <DashboardHome onAsk={noop} onOpenItinerary={noop} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ChatWindow has no violations', async () => {
    const { container } = renderWithProviders(<ChatWindow />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('StadiumMap has no violations', async () => {
    const { container } = renderWithProviders(<StadiumMap />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('OpsHud has no violations', async () => {
    const { container } = renderWithProviders(<OpsHud />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ContextBar has no violations', async () => {
    const { container } = renderWithProviders(<ContextBar />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Composer has no violations', async () => {
    const { container } = renderWithProviders(<Composer />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ItineraryPanel has no violations', async () => {
    const { container } = renderWithProviders(<ItineraryPanel />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Standings has no violations', async () => {
    const { container } = renderWithProviders(<Standings />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('CommandPalette (open) has no violations', async () => {
    const { baseElement } = renderWithProviders(
      <CommandPalette open onClose={noop} onFocusMap={noop} onAsk={noop} />,
    );
    // Dialog/palette content renders in a portal, so scan the whole document.
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it('Onboarding (open) has no violations', async () => {
    const { baseElement } = renderWithProviders(<Onboarding open onClose={noop} />);
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
