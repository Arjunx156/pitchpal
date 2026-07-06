import type { AccessibilityProfile, LanguageCode } from '../features/context/types';

/** UI chrome strings, fully localized so the interface matches the fan's language. */
export interface UiStrings {
  title: string;
  tagline: string;
  skipToChat: string;
  settingsHeading: string;
  languageLabel: string;
  accessibilityLabel: string;
  accessibility: Record<AccessibilityProfile, string>;
  locationLabel: string;
  locationPlaceholder: string;
  suggestionsHeading: string;
  suggestions: string[];
  composerLabel: string;
  composerPlaceholder: string;
  send: string;
  you: string;
  assistant: string;
  thinking: string;
  modeMock: string;
  modeLive: string;
  modeMockHint: string;
  errorGeneric: string;
  card: {
    from: string;
    to: string;
    walk: string; // uses {min}
    stepFree: string;
    notStepFree: string;
    accessible: string;
    hours: string;
    frequency: string;
  };
  theme: { label: string; system: string; light: string; dark: string };
  dataNote: string;
}

/** Endonyms — shown the same in every UI language. */
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  ar: 'العربية',
};

export const UI: Record<LanguageCode, UiStrings> = {
  en: {
    title: 'PitchPal',
    tagline: 'Your FIFA World Cup 2026 stadium companion',
    skipToChat: 'Skip to chat',
    settingsHeading: 'Your details',
    languageLabel: 'Language',
    accessibilityLabel: 'Accessibility',
    accessibility: { none: 'No specific needs', wheelchair: 'Wheelchair user', stroller: 'With a stroller', 'low-vision': 'Low vision' },
    locationLabel: 'Where are you now?',
    locationPlaceholder: 'e.g. Gate B or Section 114',
    suggestionsHeading: 'Try asking',
    suggestions: [
      'How do I get to section 205?',
      'Where is the nearest halal food?',
      'How do I leave for downtown after the match?',
    ],
    composerLabel: 'Ask PitchPal',
    composerPlaceholder: 'Ask about seats, food, access, or transport…',
    send: 'Send',
    you: 'You',
    assistant: 'PitchPal',
    thinking: 'PitchPal is typing…',
    modeMock: 'Demo mode',
    modeLive: 'Live AI',
    modeMockHint: 'Running with built-in sample answers. Add a Gemini API key for live responses.',
    errorGeneric: 'Something went wrong. Please try again.',
    card: { from: 'From', to: 'To', walk: '{min} min walk', stepFree: 'Step-free', notStepFree: 'Not step-free', accessible: 'Accessible', hours: 'Hours', frequency: 'Frequency' },
    theme: { label: 'Theme', system: 'System', light: 'Light', dark: 'Dark' },
    dataNote: 'Uses representative sample venue data — not official FIFA information.',
  },
  es: {
    title: 'PitchPal',
    tagline: 'Tu asistente del estadio para la Copa Mundial 2026',
    skipToChat: 'Ir al chat',
    settingsHeading: 'Tus datos',
    languageLabel: 'Idioma',
    accessibilityLabel: 'Accesibilidad',
    accessibility: { none: 'Sin necesidades específicas', wheelchair: 'Usuario de silla de ruedas', stroller: 'Con cochecito', 'low-vision': 'Visión reducida' },
    locationLabel: '¿Dónde estás ahora?',
    locationPlaceholder: 'p. ej. Puerta B o Sección 114',
    suggestionsHeading: 'Prueba a preguntar',
    suggestions: [
      '¿Cómo llego a la sección 205?',
      '¿Dónde está la comida halal más cercana?',
      '¿Cómo salgo hacia el centro después del partido?',
    ],
    composerLabel: 'Pregunta a PitchPal',
    composerPlaceholder: 'Pregunta por asientos, comida, accesibilidad o transporte…',
    send: 'Enviar',
    you: 'Tú',
    assistant: 'PitchPal',
    thinking: 'PitchPal está escribiendo…',
    modeMock: 'Modo demo',
    modeLive: 'IA en vivo',
    modeMockHint: 'Funciona con respuestas de ejemplo. Añade una clave de Gemini para respuestas en vivo.',
    errorGeneric: 'Algo salió mal. Inténtalo de nuevo.',
    card: { from: 'Desde', to: 'Hasta', walk: '{min} min a pie', stepFree: 'Sin escaleras', notStepFree: 'Con escaleras', accessible: 'Accesible', hours: 'Horario', frequency: 'Frecuencia' },
    theme: { label: 'Tema', system: 'Sistema', light: 'Claro', dark: 'Oscuro' },
    dataNote: 'Usa datos de ejemplo del estadio, no información oficial de la FIFA.',
  },
  fr: {
    title: 'PitchPal',
    tagline: 'Votre compagnon de stade pour la Coupe du Monde 2026',
    skipToChat: 'Aller au chat',
    settingsHeading: 'Vos informations',
    languageLabel: 'Langue',
    accessibilityLabel: 'Accessibilité',
    accessibility: { none: 'Aucun besoin particulier', wheelchair: 'Utilisateur de fauteuil roulant', stroller: 'Avec une poussette', 'low-vision': 'Malvoyance' },
    locationLabel: 'Où êtes-vous maintenant ?',
    locationPlaceholder: 'ex. Porte B ou Section 114',
    suggestionsHeading: 'Essayez de demander',
    suggestions: [
      'Comment aller à la section 205 ?',
      'Où est la nourriture halal la plus proche ?',
      'Comment partir vers le centre-ville après le match ?',
    ],
    composerLabel: 'Demandez à PitchPal',
    composerPlaceholder: 'Places, restauration, accessibilité ou transport…',
    send: 'Envoyer',
    you: 'Vous',
    assistant: 'PitchPal',
    thinking: 'PitchPal écrit…',
    modeMock: 'Mode démo',
    modeLive: 'IA en direct',
    modeMockHint: "Fonctionne avec des réponses d'exemple. Ajoutez une clé Gemini pour des réponses en direct.",
    errorGeneric: "Une erreur s'est produite. Veuillez réessayer.",
    card: { from: 'De', to: 'À', walk: '{min} min à pied', stepFree: 'Sans marches', notStepFree: 'Avec marches', accessible: 'Accessible', hours: 'Horaires', frequency: 'Fréquence' },
    theme: { label: 'Thème', system: 'Système', light: 'Clair', dark: 'Sombre' },
    dataNote: "Utilise des données de stade d'exemple, pas d'informations officielles FIFA.",
  },
  pt: {
    title: 'PitchPal',
    tagline: 'Seu companheiro de estádio para a Copa do Mundo 2026',
    skipToChat: 'Ir para o chat',
    settingsHeading: 'Seus dados',
    languageLabel: 'Idioma',
    accessibilityLabel: 'Acessibilidade',
    accessibility: { none: 'Sem necessidades específicas', wheelchair: 'Usuário de cadeira de rodas', stroller: 'Com carrinho de bebê', 'low-vision': 'Baixa visão' },
    locationLabel: 'Onde você está agora?',
    locationPlaceholder: 'ex. Portão B ou Seção 114',
    suggestionsHeading: 'Experimente perguntar',
    suggestions: [
      'Como chego à seção 205?',
      'Onde fica a comida halal mais próxima?',
      'Como saio para o centro depois do jogo?',
    ],
    composerLabel: 'Pergunte ao PitchPal',
    composerPlaceholder: 'Pergunte sobre lugares, comida, acesso ou transporte…',
    send: 'Enviar',
    you: 'Você',
    assistant: 'PitchPal',
    thinking: 'PitchPal está digitando…',
    modeMock: 'Modo demo',
    modeLive: 'IA ao vivo',
    modeMockHint: 'Funciona com respostas de exemplo. Adicione uma chave Gemini para respostas ao vivo.',
    errorGeneric: 'Algo deu errado. Tente novamente.',
    card: { from: 'De', to: 'Para', walk: '{min} min a pé', stepFree: 'Sem degraus', notStepFree: 'Com degraus', accessible: 'Acessível', hours: 'Horário', frequency: 'Frequência' },
    theme: { label: 'Tema', system: 'Sistema', light: 'Claro', dark: 'Escuro' },
    dataNote: 'Usa dados de exemplo do estádio, não informações oficiais da FIFA.',
  },
  ar: {
    title: 'PitchPal',
    tagline: 'رفيقك في الملعب لكأس العالم 2026',
    skipToChat: 'الانتقال إلى المحادثة',
    settingsHeading: 'بياناتك',
    languageLabel: 'اللغة',
    accessibilityLabel: 'إمكانية الوصول',
    accessibility: { none: 'لا احتياجات خاصة', wheelchair: 'مستخدم كرسي متحرك', stroller: 'مع عربة أطفال', 'low-vision': 'ضعف البصر' },
    locationLabel: 'أين أنت الآن؟',
    locationPlaceholder: 'مثال: البوابة B أو القسم 114',
    suggestionsHeading: 'جرّب أن تسأل',
    suggestions: [
      'كيف أصل إلى القسم 205؟',
      'أين أقرب طعام حلال؟',
      'كيف أغادر إلى وسط المدينة بعد المباراة؟',
    ],
    composerLabel: 'اسأل PitchPal',
    composerPlaceholder: 'اسأل عن المقاعد أو الطعام أو الوصول أو المواصلات…',
    send: 'إرسال',
    you: 'أنت',
    assistant: 'PitchPal',
    thinking: 'PitchPal يكتب…',
    modeMock: 'وضع العرض',
    modeLive: 'ذكاء اصطناعي مباشر',
    modeMockHint: 'يعمل بإجابات نموذجية. أضف مفتاح Gemini للحصول على إجابات مباشرة.',
    errorGeneric: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    card: { from: 'من', to: 'إلى', walk: '{min} دقيقة سيرًا', stepFree: 'خالٍ من الدرج', notStepFree: 'به درج', accessible: 'مناسب لذوي الإعاقة', hours: 'ساعات العمل', frequency: 'التكرار' },
    theme: { label: 'المظهر', system: 'النظام', light: 'فاتح', dark: 'داكن' },
    dataNote: 'يستخدم بيانات ملعب نموذجية، وليست معلومات رسمية من الفيفا.',
  },
};
