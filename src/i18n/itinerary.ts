import type { LanguageCode } from '../features/context/types';
import type { ItineraryStepKind } from '../features/itinerary/itinerary';

/**
 * Localized labels for the "My Match Day" timeline steps. Kept beside the other
 * i18n tables so the dashboard preview and the itinerary panel read the same
 * words in every language.
 */
export const ITINERARY_LABELS: Record<
  LanguageCode,
  Record<Exclude<ItineraryStepKind, 'custom'>, string>
> = {
  en: { arrive: 'Arrive', gate: 'Enter gate', seat: 'Find seat', kickoff: 'Kickoff', halftime: 'Half-time', leave: 'Head home' },
  es: { arrive: 'Llegada', gate: 'Entrar por puerta', seat: 'Buscar asiento', kickoff: 'Inicio', halftime: 'Descanso', leave: 'Volver a casa' },
  fr: { arrive: 'Arrivée', gate: 'Entrer', seat: 'Trouver la place', kickoff: 'Coup d’envoi', halftime: 'Mi-temps', leave: 'Rentrer' },
  pt: { arrive: 'Chegada', gate: 'Entrar no portão', seat: 'Achar assento', kickoff: 'Início', halftime: 'Intervalo', leave: 'Voltar' },
  ar: { arrive: 'الوصول', gate: 'ادخل البوابة', seat: 'اعثر على مقعدك', kickoff: 'انطلاق', halftime: 'استراحة', leave: 'العودة' },
};
