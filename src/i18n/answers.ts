import type { LanguageCode } from '../features/context/types';
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
