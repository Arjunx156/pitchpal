import { Component, type ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  /** Localized message shown when the subtree crashes. */
  heading: string;
  /** Localized label for the reset button. */
  actionLabel: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render errors so a crashing panel degrades to a localized fallback
 * instead of blanking the whole HUD. Must stay a class component — function
 * components cannot catch render errors.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="glass flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center"
        >
          <p className="text-sm text-muted-foreground">{this.props.heading}</p>
          <Button variant="secondary" size="sm" onClick={this.reset}>
            {this.props.actionLabel}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
