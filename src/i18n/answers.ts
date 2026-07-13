import type { LanguageCode } from '../features/context/types';
import type { MatchMoment } from '../features/tournament/moments';
import type { Level, Side } from '../features/venue/types';

/**
 * Phrase templates the deterministic composer uses to build grounded answers in
 * the fan's language. Placeholders are written as {name} and filled by fmt().
 * Live Gemini responses do full free-form translation; these keep the offline
 * mock genuinely multilingual so the demo works with no API key.
 */
export interface AnswerPhrases {
  navIntro: string;
  navTitle: string; // {section}
  enterGate: string; // {gate}
  elevator: string; // {level}
  headTo: string; // {level}
  sectionInfo: string; // {section} {side} {min}
  stepFreeYes: string;
  stepFreeNo: string;
  gateBusy: string; // {gate} {min}
  gateQuieter: string; // {gate}
  amenityTitle: string;
  amenityIntro: string;
  amenityNear: string; // {section} {level}
  amenityNone: string;
  transportTitle: string;
  transportIntro: string;
  generalIntro: string;
  labelStepFree: string;
  labelAccessible: string;
  labelHours: string; // {hours}
  labelFrequency: string; // {freq}
  levels: Record<Level, string>;
  sides: Record<Side, string>;
  mockNote: string;
}

export const ANSWER_PHRASES: Record<LanguageCode, AnswerPhrases> = {
  en: {
    navIntro: "Here's how to reach your seat:",
    navTitle: 'Directions to section {section}',
    enterGate: 'Enter at {gate}.',
    elevator: 'Take the elevator up to the {level} level.',
    headTo: 'Head to the {level} level.',
    sectionInfo: 'Section {section} is on the {side} side, about {min} min from the gate.',
    stepFreeYes: 'Good news: this route is step-free.',
    stepFreeNo: "Heads up: this section isn't step-free. Visit the Fan Information Point for an accessible route.",
    gateBusy: '{gate} is very busy right now — about {min} min to get in.',
    gateQuieter: 'For a quieter step-free entrance, try {gate}.',
    amenityTitle: 'Nearby options',
    amenityIntro: 'Here are the closest options:',
    amenityNear: 'Near section {section}, {level} level.',
    amenityNone: "I couldn't find that here. A Fan Information Point can help.",
    transportTitle: 'Getting away from the stadium',
    transportIntro: 'Here are your best options to leave:',
    generalIntro:
      "Hi! I'm PitchPal, your stadium companion. I can help you find your seat, food and amenities, accessible routes, and transport. What do you need?",
    labelStepFree: 'step-free',
    labelAccessible: 'accessible',
    labelHours: 'Hours: {hours}',
    labelFrequency: 'Frequency: {freq}',
    levels: { lower: 'lower', club: 'club', upper: 'upper', concourse: 'concourse' },
    sides: { north: 'north', south: 'south', east: 'east', west: 'west' },
    mockNote: 'Demo mode: sample answer generated without a live AI key.',
  },
  es: {
    navIntro: 'Así puedes llegar a tu asiento:',
    navTitle: 'Cómo llegar a la sección {section}',
    enterGate: 'Entra por {gate}.',
    elevator: 'Toma el ascensor hasta el nivel {level}.',
    headTo: 'Dirígete al nivel {level}.',
    sectionInfo: 'La sección {section} está en el lado {side}, a unos {min} min de la puerta.',
    stepFreeYes: 'Buenas noticias: esta ruta es sin escaleras.',
    stepFreeNo: 'Aviso: esta sección no es sin escaleras. Visita el Punto de Información para una ruta accesible.',
    gateBusy: '{gate} está muy concurrida ahora — unos {min} min para entrar.',
    gateQuieter: 'Para una entrada sin escaleras más tranquila, prueba {gate}.',
    amenityTitle: 'Opciones cercanas',
    amenityIntro: 'Estas son las opciones más cercanas:',
    amenityNear: 'Cerca de la sección {section}, nivel {level}.',
    amenityNone: 'No lo encontré aquí. El Punto de Información puede ayudarte.',
    transportTitle: 'Salir del estadio',
    transportIntro: 'Estas son tus mejores opciones para salir:',
    generalIntro:
      '¡Hola! Soy PitchPal, tu asistente del estadio. Puedo ayudarte a encontrar tu asiento, comida y servicios, rutas accesibles y transporte. ¿Qué necesitas?',
    labelStepFree: 'sin escaleras',
    labelAccessible: 'accesible',
    labelHours: 'Horario: {hours}',
    labelFrequency: 'Frecuencia: {freq}',
    levels: { lower: 'inferior', club: 'club', upper: 'superior', concourse: 'vestíbulo' },
    sides: { north: 'norte', south: 'sur', east: 'este', west: 'oeste' },
    mockNote: 'Modo demo: respuesta de ejemplo generada sin una clave de IA.',
  },
  fr: {
    navIntro: 'Voici comment rejoindre votre place :',
    navTitle: 'Itinéraire vers la section {section}',
    enterGate: 'Entrez par {gate}.',
    elevator: "Prenez l'ascenseur jusqu'au niveau {level}.",
    headTo: 'Dirigez-vous vers le niveau {level}.',
    sectionInfo: 'La section {section} est du côté {side}, à environ {min} min de la porte.',
    stepFreeYes: 'Bonne nouvelle : cet itinéraire est sans marches.',
    stepFreeNo: "À noter : cette section n'est pas sans marches. Rendez-vous au Point d'Information pour un itinéraire accessible.",
    gateBusy: '{gate} est très fréquentée en ce moment — environ {min} min pour entrer.',
    gateQuieter: 'Pour une entrée sans marches plus calme, essayez {gate}.',
    amenityTitle: 'Options à proximité',
    amenityIntro: 'Voici les options les plus proches :',
    amenityNear: 'Près de la section {section}, niveau {level}.',
    amenityNone: "Je ne l'ai pas trouvé ici. Un Point d'Information peut vous aider.",
    transportTitle: 'Quitter le stade',
    transportIntro: 'Voici vos meilleures options pour partir :',
    generalIntro:
      "Bonjour ! Je suis PitchPal, votre compagnon de stade. Je peux vous aider à trouver votre place, la restauration et les services, les itinéraires accessibles et les transports. Que vous faut-il ?",
    labelStepFree: 'sans marches',
    labelAccessible: 'accessible',
    labelHours: 'Horaires : {hours}',
    labelFrequency: 'Fréquence : {freq}',
    levels: { lower: 'inférieur', club: 'club', upper: 'supérieur', concourse: 'hall' },
    sides: { north: 'nord', south: 'sud', east: 'est', west: 'ouest' },
    mockNote: "Mode démo : réponse d'exemple générée sans clé IA.",
  },
  pt: {
    navIntro: 'Veja como chegar ao seu lugar:',
    navTitle: 'Como chegar à seção {section}',
    enterGate: 'Entre pelo {gate}.',
    elevator: 'Pegue o elevador até o nível {level}.',
    headTo: 'Siga até o nível {level}.',
    sectionInfo: 'A seção {section} fica no lado {side}, a cerca de {min} min do portão.',
    stepFreeYes: 'Boa notícia: este trajeto é sem degraus.',
    stepFreeNo: 'Atenção: esta seção não é sem degraus. Vá ao Ponto de Informação para uma rota acessível.',
    gateBusy: '{gate} está muito movimentado agora — cerca de {min} min para entrar.',
    gateQuieter: 'Para uma entrada sem degraus mais tranquila, tente {gate}.',
    amenityTitle: 'Opções próximas',
    amenityIntro: 'Estas são as opções mais próximas:',
    amenityNear: 'Perto da seção {section}, nível {level}.',
    amenityNone: 'Não encontrei isso aqui. Um Ponto de Informação pode ajudar.',
    transportTitle: 'Sair do estádio',
    transportIntro: 'Estas são as melhores opções para sair:',
    generalIntro:
      'Olá! Sou o PitchPal, seu companheiro no estádio. Posso ajudar a encontrar seu lugar, comida e serviços, rotas acessíveis e transporte. Do que você precisa?',
    labelStepFree: 'sem degraus',
    labelAccessible: 'acessível',
    labelHours: 'Horário: {hours}',
    labelFrequency: 'Frequência: {freq}',
    levels: { lower: 'inferior', club: 'club', upper: 'superior', concourse: 'saguão' },
    sides: { north: 'norte', south: 'sul', east: 'leste', west: 'oeste' },
    mockNote: 'Modo demo: resposta de exemplo gerada sem uma chave de IA.',
  },
  ar: {
    navIntro: 'إليك كيفية الوصول إلى مقعدك:',
    navTitle: 'الاتجاهات إلى القسم {section}',
    enterGate: 'ادخل من {gate}.',
    elevator: 'استقل المصعد إلى المستوى {level}.',
    headTo: 'توجّه إلى المستوى {level}.',
    sectionInfo: 'القسم {section} في الجهة {side}، على بُعد حوالي {min} دقيقة من البوابة.',
    stepFreeYes: 'خبر جيد: هذا المسار خالٍ من الدرج.',
    stepFreeNo: 'تنبيه: هذا القسم ليس خاليًا من الدرج. توجّه إلى نقطة معلومات المشجعين للحصول على مسار مناسب لذوي الإعاقة.',
    gateBusy: '{gate} مزدحمة جدًا الآن — حوالي {min} دقيقة للدخول.',
    gateQuieter: 'للدخول من مكان أهدأ وخالٍ من الدرج، جرّب {gate}.',
    amenityTitle: 'خيارات قريبة',
    amenityIntro: 'إليك أقرب الخيارات:',
    amenityNear: 'قرب القسم {section}، المستوى {level}.',
    amenityNone: 'لم أعثر على ذلك هنا. يمكن لنقطة معلومات المشجعين مساعدتك.',
    transportTitle: 'مغادرة الملعب',
    transportIntro: 'إليك أفضل خيارات المغادرة:',
    generalIntro:
      'مرحبًا! أنا PitchPal، رفيقك في الملعب. يمكنني مساعدتك في العثور على مقعدك، والطعام والخدمات، والمسارات المناسبة لذوي الإعاقة، والمواصلات. بماذا يمكنني مساعدتك؟',
    labelStepFree: 'خالٍ من الدرج',
    labelAccessible: 'مناسب لذوي الإعاقة',
    labelHours: 'ساعات العمل: {hours}',
    labelFrequency: 'التكرار: {freq}',
    levels: { lower: 'السفلي', club: 'النادي', upper: 'العلوي', concourse: 'الردهة' },
    sides: { north: 'الشمالية', south: 'الجنوبية', east: 'الشرقية', west: 'الغربية' },
    mockNote: 'وضع العرض: إجابة نموذجية مُولّدة بدون مفتاح ذكاء اصطناعي.',
  },
};

/** Fill {placeholders} in a template. Missing keys are left untouched. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole,
  );
}

/** One localized ticker/stinger line for a match moment, e.g. `12' GOAL — BRA #9`. */
export function formatMoment(moment: MatchMoment, language: LanguageCode): string {
  const label = MOMENT_LABELS[language][moment.kind];
  const who = [moment.teamCode, moment.detail].filter(Boolean).join(' ');
  return who ? `${moment.minute}' ${label} — ${who}` : `${moment.minute}' ${label}`;
}

/** Sustainability (green-route) phrases. */
export const ECO_PHRASES: Record<LanguageCode, { title: string; greenest: string; carbon: string }> = {
  en: { title: 'Greenest ways to leave', greenest: 'Greenest option: {name} — about {kg} kg CO₂.', carbon: '~{kg} kg CO₂' },
  es: { title: 'Formas más ecológicas de salir', greenest: 'Opción más ecológica: {name} — unos {kg} kg CO₂.', carbon: '~{kg} kg CO₂' },
  fr: { title: 'Départs les plus écologiques', greenest: 'Option la plus verte : {name} — environ {kg} kg CO₂.', carbon: '~{kg} kg CO₂' },
  pt: { title: 'Formas mais ecológicas de sair', greenest: 'Opção mais verde: {name} — cerca de {kg} kg CO₂.', carbon: '~{kg} kg CO₂' },
  ar: { title: 'أكثر طرق المغادرة صداقة للبيئة', greenest: 'الخيار الأكثر خضرة: {name} — حوالي {kg} كجم CO₂.', carbon: '~{kg} كجم CO₂' },
};

export type AccessServiceKey = 'wheelchair' | 'sensory-room' | 'meeting-point';

/** Accessibility-service booking phrases. */
export const ACCESS_PHRASES: Record<
  LanguageCode,
  { booked: string; services: Record<AccessServiceKey, string> }
> = {
  en: { booked: '{service} is booked (ref {ref}). Staff will meet you{where}.', services: { wheelchair: 'Wheelchair assistance', 'sensory-room': 'Sensory room access', 'meeting-point': 'Accessible meeting point' } },
  es: { booked: '{service} reservado (ref {ref}). El personal te recibirá{where}.', services: { wheelchair: 'Asistencia en silla de ruedas', 'sensory-room': 'Acceso a sala sensorial', 'meeting-point': 'Punto de encuentro accesible' } },
  fr: { booked: '{service} réservé (réf {ref}). Le personnel vous accueillera{where}.', services: { wheelchair: 'Assistance en fauteuil roulant', 'sensory-room': 'Accès à la salle sensorielle', 'meeting-point': 'Point de rencontre accessible' } },
  pt: { booked: '{service} reservado (ref {ref}). A equipe vai recebê-lo{where}.', services: { wheelchair: 'Assistência em cadeira de rodas', 'sensory-room': 'Acesso à sala sensorial', 'meeting-point': 'Ponto de encontro acessível' } },
  ar: { booked: 'تم حجز {service} (المرجع {ref}). سيستقبلك الطاقم{where}.', services: { wheelchair: 'مساعدة الكرسي المتحرك', 'sensory-room': 'الدخول إلى الغرفة الحسية', 'meeting-point': 'نقطة لقاء مناسبة' } },
};

/** Match-status phrases for the getMatchStatus tool (score questions). */
export const MATCH_PHRASES: Record<
  LanguageCode,
  { live: string; pre: string; post: string; latest: string }
> = {
  en: { live: "{home} {hs}–{as} {away}, {min}' and counting.", pre: '{home} vs {away} kicks off in {min} min — still 0–0.', post: 'Full time: {home} {hs}–{as} {away}.', latest: 'Latest: {event}.' },
  es: { live: '{home} {hs}–{as} {away}, minuto {min}.', pre: '{home} vs {away} comienza en {min} min — aún 0–0.', post: 'Final: {home} {hs}–{as} {away}.', latest: 'Último: {event}.' },
  fr: { live: '{home} {hs}–{as} {away}, {min}e minute.', pre: '{home} vs {away} commence dans {min} min — toujours 0–0.', post: 'Score final : {home} {hs}–{as} {away}.', latest: 'Dernier fait : {event}.' },
  pt: { live: '{home} {hs}–{as} {away}, {min} minutos.', pre: '{home} vs {away} começa em {min} min — ainda 0–0.', post: 'Fim de jogo: {home} {hs}–{as} {away}.', latest: 'Último: {event}.' },
  ar: { live: '{home} {hs}–{as} {away}، الدقيقة {min}.', pre: '{home} ضد {away} تبدأ بعد {min} دقيقة — لا تزال 0–0.', post: 'النتيجة النهائية: {home} {hs}–{as} {away}.', latest: 'آخر حدث: {event}.' },
};

/** Localized labels for match-moment kinds (ticker + assistant). */
export const MOMENT_LABELS: Record<
  LanguageCode,
  Record<'kickoff' | 'goal' | 'yellow' | 'sub' | 'halftime' | 'fulltime', string>
> = {
  en: { kickoff: 'Kickoff', goal: 'GOAL', yellow: 'Yellow card', sub: 'Substitution', halftime: 'Half-time', fulltime: 'Full time' },
  es: { kickoff: 'Inicio', goal: 'GOL', yellow: 'Tarjeta amarilla', sub: 'Cambio', halftime: 'Descanso', fulltime: 'Final' },
  fr: { kickoff: 'Coup d’envoi', goal: 'BUT', yellow: 'Carton jaune', sub: 'Remplacement', halftime: 'Mi-temps', fulltime: 'Fin du match' },
  pt: { kickoff: 'Início', goal: 'GOL', yellow: 'Cartão amarelo', sub: 'Substituição', halftime: 'Intervalo', fulltime: 'Fim de jogo' },
  ar: { kickoff: 'انطلاق', goal: 'هدف', yellow: 'بطاقة صفراء', sub: 'تبديل', halftime: 'استراحة', fulltime: 'نهاية المباراة' },
};
