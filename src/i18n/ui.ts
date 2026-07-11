/**
 * Barrel for the localized UI string tables. The interface and each dictionary
 * live in `./strings/*` (split by concern to keep every file small and focused);
 * this file re-exports them so consumers keep importing from `../i18n/ui`.
 */
export type {
  QuickAction,
  UiStrings,
  ScanStrings,
  ItineraryStrings,
  AnalyticsStrings,
} from './strings/types';
export { LANGUAGE_NAMES, UI, QUICK_ACTION_KEYS, type QuickActionKey } from './strings/ui-strings';
export { TOOL_STATUS } from './strings/tool-status';
export { ANALYTICS } from './strings/analytics';
export { ITINERARY } from './strings/itinerary';
export { SCAN_STRINGS } from './strings/scan';
