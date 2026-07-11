import type { LanguageCode } from '../../features/context/types';
import type { AnalyticsStrings } from './types';

/** Localized strings for the crowd heatmap + analytics strip. */
export const ANALYTICS: Record<LanguageCode, AnalyticsStrings> = {
  en: { heading: 'Live analytics', heatmap: 'Crowd heatmap', crowd: 'Stadium crowd', queue: 'Queue · Gate {gate}', low: 'Quiet', medium: 'Filling', high: 'Packed', crowdSummary: 'Stadium is {pct}% full and rising.', queueSummary: 'Busiest gate {gate}, about {min} min.' },
  es: { heading: 'Analíticas en vivo', heatmap: 'Mapa de calor', crowd: 'Público del estadio', queue: 'Cola · Puerta {gate}', low: 'Tranquilo', medium: 'Llenándose', high: 'Lleno', crowdSummary: 'El estadio está al {pct}% y subiendo.', queueSummary: 'Puerta más concurrida {gate}, unos {min} min.' },
  fr: { heading: 'Analyses en direct', heatmap: 'Carte de chaleur', crowd: 'Affluence du stade', queue: 'File · Porte {gate}', low: 'Calme', medium: 'Se remplit', high: 'Comble', crowdSummary: 'Le stade est rempli à {pct}% et augmente.', queueSummary: 'Porte la plus fréquentée {gate}, environ {min} min.' },
  pt: { heading: 'Análises ao vivo', heatmap: 'Mapa de calor', crowd: 'Público do estádio', queue: 'Fila · Portão {gate}', low: 'Tranquilo', medium: 'Enchendo', high: 'Lotado', crowdSummary: 'O estádio está {pct}% cheio e subindo.', queueSummary: 'Portão mais movimentado {gate}, cerca de {min} min.' },
  ar: { heading: 'تحليلات مباشرة', heatmap: 'خريطة حرارية', crowd: 'حضور الملعب', queue: 'الطابور · البوابة {gate}', low: 'هادئ', medium: 'يمتلئ', high: 'مكتظ', crowdSummary: 'الملعب ممتلئ بنسبة {pct}% وفي ازدياد.', queueSummary: 'أكثر البوابات ازدحامًا {gate}، حوالي {min} دقيقة.' },
};
