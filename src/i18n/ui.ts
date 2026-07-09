import type { AccessibilityProfile, LanguageCode } from '../features/context/types';

/** UI chrome strings, fully localized so the interface matches the fan's language. */
export interface QuickAction {
  label: string;
  query: string;
}

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
  matchLabel: string;
  suggestionsHeading: string;
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
  retry: string;
  stop: string;
  install: string;
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
  offline: { badge: string; hint: string };
  voice: { listen: string; stopListening: string; readAloud: string; stopReading: string };
  ops: {
    heading: string;
    preMatch: string;
    live: string;
    postMatch: string;
    gatesHeading: string;
    gate: string;
    queue: string; // {min}
    weather: string;
    weatherClear: string;
    weatherCloudy: string;
    weatherRain: string;
    quiet: string;
    busy: string;
    packed: string;
  };
  map: {
    heading: string;
    tabChat: string;
    tabMap: string;
    legendGate: string;
    legendSeat: string;
    legendAmenity: string;
    legendRoute: string;
    summaryIdle: string;
    summaryRoute: string; // {from} {to}
    focus: string;
    askSection: string; // {id}
    askGate: string; // {id}
  };
  quickActions: {
    heading: string;
    seat: QuickAction;
    food: QuickAction;
    restroom: QuickAction;
    accessible: QuickAction;
    leave: QuickAction;
    firstAid: QuickAction;
    score: QuickAction;
  };
  commandPalette: {
    open: string;
    placeholder: string;
    empty: string;
    groupAsk: string;
    groupSettings: string;
    changeLanguage: string;
    toggleTheme: string;
    toggleReadAloud: string;
    focusMap: string;
  };
  onboarding: {
    title: string;
    subtitle: string;
    stepLanguage: string;
    stepAccess: string;
    stepSeat: string;
    next: string;
    back: string;
    finish: string;
    skip: string;
    step: string; // {n} {total}
  };
  dataNote: string;
  standings: {
    heading: string;
    played: string;
    points: string;
  };
  nav: {
    heading: string;
    switcherHeading: string;
    home: string;
    chat: string;
    map: string;
    itinerary: string;
    more: string;
  };
  dashboard: {
    heading: string;
    heroLabel: string;
    riskHeading: string;
    suggestedHeading: string;
    seeAll: string;
  };
  risk: {
    heading: string;
    rising: string;
    falling: string;
    steady: string;
    rerouteAsk: string; // {gate}
    rerouteCta: string;
    projectedIn: string; // {min}
  };
  suggestions: {
    kickoffSoonReason: string;
    kickoffSoonQuery: string;
    gateJamReason: string; // {gate}
    postMatchReason: string;
    postMatchQuery: string;
    accessibleRouteReason: string;
  };
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
    matchLabel: 'Match',
    suggestionsHeading: 'Try asking',
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
    retry: 'Retry',
    stop: 'Stop',
    install: 'Install app',
    card: { from: 'From', to: 'To', walk: '{min} min walk', stepFree: 'Step-free', notStepFree: 'Not step-free', accessible: 'Accessible', hours: 'Hours', frequency: 'Frequency' },
    theme: { label: 'Theme', system: 'System', light: 'Light', dark: 'Dark' },
    offline: { badge: 'Offline', hint: 'No connection — answers are generated on your device.' },
    voice: { listen: 'Speak your question', stopListening: 'Stop listening', readAloud: 'Read answer aloud', stopReading: 'Stop reading' },
    ops: { heading: 'Match day', preMatch: 'Kickoff in', live: 'Live', postMatch: 'Full time', gatesHeading: 'Gate queues', gate: 'Gate', queue: '{min} min', weather: 'Weather', weatherClear: 'Clear', weatherCloudy: 'Cloudy', weatherRain: 'Rain', quiet: 'Quiet', busy: 'Busy', packed: 'Packed' },
    map: { heading: 'Stadium map', tabChat: 'Chat', tabMap: 'Map', legendGate: 'Gate', legendSeat: 'Your seat', legendAmenity: 'Places', legendRoute: 'Route', summaryIdle: 'Interactive stadium map. Ask a question to light up your route.', summaryRoute: 'Route highlighted from {from} to section {to}.', focus: 'Show stadium map', askSection: 'How do I get to section {id}?', askGate: 'Tell me about Gate {id}.' },
    quickActions: {
      heading: 'Quick help',
      seat: { label: 'Find my seat', query: 'How do I get to my seat?' },
      food: { label: 'Food & drink', query: "Where's the nearest food?" },
      restroom: { label: 'Restrooms', query: "Where's the nearest restroom?" },
      accessible: { label: 'Step-free route', query: 'Show me a step-free route to my seat.' },
      leave: { label: 'Leave the stadium', query: 'How do I get downtown after the match?' },
      firstAid: { label: 'First aid', query: "Where's the nearest first aid station?" },
      score: { label: 'Live score', query: "What's the score?" },
    },
    commandPalette: { open: 'Command palette', placeholder: 'Search actions…', empty: 'No matching actions', groupAsk: 'Ask PitchPal', groupSettings: 'Settings', changeLanguage: 'Change language', toggleTheme: 'Switch theme', toggleReadAloud: 'Toggle read-aloud', focusMap: 'Show stadium map' },
    onboarding: { title: 'Welcome to PitchPal', subtitle: 'Set up your match-day companion.', stepLanguage: 'Your language', stepAccess: 'Accessibility', stepSeat: 'Your seat or gate', next: 'Next', back: 'Back', finish: 'Start exploring', skip: 'Skip', step: 'Step {n} of {total}' },
    dataNote: 'Uses representative sample venue data — not official FIFA information.',
    standings: { heading: 'Group standings', played: 'P', points: 'Pts' },
    nav: { heading: 'Main navigation', switcherHeading: 'Switch view', home: 'Home', chat: 'Chat', map: 'Map', itinerary: 'Itinerary', more: 'More' },
    dashboard: { heading: 'Match day', heroLabel: 'Live score', riskHeading: 'Gate risk', suggestedHeading: 'Suggested for you', seeAll: 'See full itinerary' },
    risk: { heading: 'Gate risk forecast', rising: 'Rising', falling: 'Falling', steady: 'Steady', rerouteAsk: 'Gate {gate} looks like it will be busy — suggest a reroute.', rerouteCta: 'Ask AI to reroute', projectedIn: 'in {min} min' },
    suggestions: {
      kickoffSoonReason: 'Kickoff is soon — grab anything you need now.',
      kickoffSoonQuery: 'What amenities are close to my seat before kickoff?',
      gateJamReason: 'Gate {gate} is getting congested.',
      postMatchReason: 'The match has ended — plan your way home.',
      postMatchQuery: 'How do I get downtown after the match?',
      accessibleRouteReason: "Here's a quieter, step-free route.",
    },
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
    matchLabel: 'Partido',
    suggestionsHeading: 'Prueba a preguntar',
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
    retry: 'Reintentar',
    stop: 'Detener',
    install: 'Instalar app',
    card: { from: 'Desde', to: 'Hasta', walk: '{min} min a pie', stepFree: 'Sin escaleras', notStepFree: 'Con escaleras', accessible: 'Accesible', hours: 'Horario', frequency: 'Frecuencia' },
    theme: { label: 'Tema', system: 'Sistema', light: 'Claro', dark: 'Oscuro' },
    offline: { badge: 'Sin conexión', hint: 'Sin conexión: las respuestas se generan en tu dispositivo.' },
    voice: { listen: 'Habla tu pregunta', stopListening: 'Dejar de escuchar', readAloud: 'Leer respuesta en voz alta', stopReading: 'Dejar de leer' },
    ops: { heading: 'Día de partido', preMatch: 'Inicio en', live: 'En vivo', postMatch: 'Final', gatesHeading: 'Colas en las puertas', gate: 'Puerta', queue: '{min} min', weather: 'Clima', weatherClear: 'Despejado', weatherCloudy: 'Nublado', weatherRain: 'Lluvia', quiet: 'Tranquila', busy: 'Concurrida', packed: 'Saturada' },
    map: { heading: 'Mapa del estadio', tabChat: 'Chat', tabMap: 'Mapa', legendGate: 'Puerta', legendSeat: 'Tu asiento', legendAmenity: 'Lugares', legendRoute: 'Ruta', summaryIdle: 'Mapa interactivo del estadio. Haz una pregunta para iluminar tu ruta.', summaryRoute: 'Ruta resaltada desde {from} hasta la sección {to}.', focus: 'Ver mapa del estadio', askSection: '¿Cómo llego a la sección {id}?', askGate: 'Háblame de la Puerta {id}.' },
    quickActions: {
      heading: 'Ayuda rápida',
      seat: { label: 'Encontrar mi asiento', query: '¿Cómo llego a mi asiento?' },
      food: { label: 'Comida y bebida', query: '¿Dónde está la comida más cercana?' },
      restroom: { label: 'Baños', query: '¿Dónde está el baño más cercano?' },
      accessible: { label: 'Ruta sin escaleras', query: 'Muéstrame una ruta sin escaleras a mi asiento.' },
      leave: { label: 'Salir del estadio', query: '¿Cómo llego al centro después del partido?' },
      firstAid: { label: 'Primeros auxilios', query: '¿Dónde está el puesto de primeros auxilios más cercano?' },
      score: { label: 'Marcador en vivo', query: '¿Cómo va el marcador?' },
    },
    commandPalette: { open: 'Paleta de comandos', placeholder: 'Buscar acciones…', empty: 'Sin acciones coincidentes', groupAsk: 'Preguntar a PitchPal', groupSettings: 'Ajustes', changeLanguage: 'Cambiar idioma', toggleTheme: 'Cambiar tema', toggleReadAloud: 'Alternar lectura en voz alta', focusMap: 'Ver mapa del estadio' },
    onboarding: { title: 'Bienvenido a PitchPal', subtitle: 'Configura tu asistente del partido.', stepLanguage: 'Tu idioma', stepAccess: 'Accesibilidad', stepSeat: 'Tu asiento o puerta', next: 'Siguiente', back: 'Atrás', finish: 'Empezar', skip: 'Omitir', step: 'Paso {n} de {total}' },
    dataNote: 'Usa datos de ejemplo del estadio, no información oficial de la FIFA.',
    standings: { heading: 'Clasificación del grupo', played: 'PJ', points: 'Pts' },
    nav: { heading: 'Navegación principal', switcherHeading: 'Cambiar vista', home: 'Inicio', chat: 'Chat', map: 'Mapa', itinerary: 'Itinerario', more: 'Más' },
    dashboard: { heading: 'Día de partido', heroLabel: 'Marcador en vivo', riskHeading: 'Riesgo en puertas', suggestedHeading: 'Sugerido para ti', seeAll: 'Ver itinerario completo' },
    risk: { heading: 'Pronóstico de riesgo en puertas', rising: 'Aumentando', falling: 'Bajando', steady: 'Estable', rerouteAsk: 'La Puerta {gate} parece que estará concurrida — sugiere una ruta alternativa.', rerouteCta: 'Pedir a la IA una ruta alternativa', projectedIn: 'en {min} min' },
    suggestions: {
      kickoffSoonReason: 'El inicio es pronto — consigue lo que necesites ahora.',
      kickoffSoonQuery: '¿Qué servicios hay cerca de mi asiento antes del inicio?',
      gateJamReason: 'La Puerta {gate} se está congestionando.',
      postMatchReason: 'El partido terminó — planifica tu regreso.',
      postMatchQuery: '¿Cómo llego al centro después del partido?',
      accessibleRouteReason: 'Aquí tienes una ruta más tranquila y sin escaleras.',
    },
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
    matchLabel: 'Match',
    suggestionsHeading: 'Essayez de demander',
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
    retry: 'Réessayer',
    stop: 'Arrêter',
    install: "Installer l'app",
    card: { from: 'De', to: 'À', walk: '{min} min à pied', stepFree: 'Sans marches', notStepFree: 'Avec marches', accessible: 'Accessible', hours: 'Horaires', frequency: 'Fréquence' },
    theme: { label: 'Thème', system: 'Système', light: 'Clair', dark: 'Sombre' },
    offline: { badge: 'Hors ligne', hint: 'Pas de connexion — les réponses sont générées sur votre appareil.' },
    voice: { listen: 'Posez votre question', stopListening: "Arrêter l'écoute", readAloud: 'Lire la réponse à voix haute', stopReading: 'Arrêter la lecture' },
    ops: { heading: 'Jour de match', preMatch: 'Coup d’envoi dans', live: 'En direct', postMatch: 'Fin du match', gatesHeading: 'Files aux portes', gate: 'Porte', queue: '{min} min', weather: 'Météo', weatherClear: 'Dégagé', weatherCloudy: 'Nuageux', weatherRain: 'Pluie', quiet: 'Calme', busy: 'Fréquentée', packed: 'Saturée' },
    map: { heading: 'Plan du stade', tabChat: 'Chat', tabMap: 'Plan', legendGate: 'Porte', legendSeat: 'Votre place', legendAmenity: 'Lieux', legendRoute: 'Itinéraire', summaryIdle: 'Plan interactif du stade. Posez une question pour afficher votre itinéraire.', summaryRoute: 'Itinéraire affiché de {from} à la section {to}.', focus: 'Afficher le plan du stade', askSection: 'Comment aller à la section {id} ?', askGate: 'Parlez-moi de la Porte {id}.' },
    quickActions: {
      heading: 'Aide rapide',
      seat: { label: 'Trouver ma place', query: 'Comment rejoindre ma place ?' },
      food: { label: 'Restauration', query: 'Où est la restauration la plus proche ?' },
      restroom: { label: 'Toilettes', query: 'Où sont les toilettes les plus proches ?' },
      accessible: { label: 'Itinéraire sans marches', query: 'Montrez-moi un itinéraire sans marches vers ma place.' },
      leave: { label: 'Quitter le stade', query: 'Comment rejoindre le centre-ville après le match ?' },
      firstAid: { label: 'Premiers secours', query: 'Où est le poste de premiers secours le plus proche ?' },
      score: { label: 'Score en direct', query: 'Quel est le score ?' },
    },
    commandPalette: { open: 'Palette de commandes', placeholder: 'Rechercher des actions…', empty: 'Aucune action correspondante', groupAsk: 'Demander à PitchPal', groupSettings: 'Réglages', changeLanguage: 'Changer de langue', toggleTheme: 'Changer de thème', toggleReadAloud: 'Activer la lecture à voix haute', focusMap: 'Afficher le plan du stade' },
    onboarding: { title: 'Bienvenue sur PitchPal', subtitle: 'Configurez votre compagnon de match.', stepLanguage: 'Votre langue', stepAccess: 'Accessibilité', stepSeat: 'Votre place ou porte', next: 'Suivant', back: 'Retour', finish: 'Commencer', skip: 'Passer', step: 'Étape {n} sur {total}' },
    dataNote: "Utilise des données de stade d'exemple, pas d'informations officielles FIFA.",
    standings: { heading: 'Classement du groupe', played: 'J', points: 'Pts' },
    nav: { heading: 'Navigation principale', switcherHeading: 'Changer de vue', home: 'Accueil', chat: 'Chat', map: 'Plan', itinerary: 'Itinéraire', more: 'Plus' },
    dashboard: { heading: 'Jour de match', heroLabel: 'Score en direct', riskHeading: 'Risque aux portes', suggestedHeading: 'Suggéré pour vous', seeAll: "Voir l'itinéraire complet" },
    risk: { heading: 'Prévision de risque aux portes', rising: 'En hausse', falling: 'En baisse', steady: 'Stable', rerouteAsk: 'La Porte {gate} semble sur le point de se remplir — suggérez un autre itinéraire.', rerouteCta: 'Demander un autre itinéraire à l’IA', projectedIn: 'dans {min} min' },
    suggestions: {
      kickoffSoonReason: "Le coup d'envoi approche — prenez ce qu'il vous faut maintenant.",
      kickoffSoonQuery: "Quels services se trouvent près de ma place avant le coup d'envoi ?",
      gateJamReason: 'La Porte {gate} devient encombrée.',
      postMatchReason: 'Le match est terminé — planifiez votre retour.',
      postMatchQuery: 'Comment rejoindre le centre-ville après le match ?',
      accessibleRouteReason: 'Voici un itinéraire plus calme et sans marches.',
    },
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
    matchLabel: 'Partida',
    suggestionsHeading: 'Experimente perguntar',
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
    retry: 'Tentar novamente',
    stop: 'Parar',
    install: 'Instalar app',
    card: { from: 'De', to: 'Para', walk: '{min} min a pé', stepFree: 'Sem degraus', notStepFree: 'Com degraus', accessible: 'Acessível', hours: 'Horário', frequency: 'Frequência' },
    theme: { label: 'Tema', system: 'Sistema', light: 'Claro', dark: 'Escuro' },
    offline: { badge: 'Offline', hint: 'Sem conexão — as respostas são geradas no seu dispositivo.' },
    voice: { listen: 'Fale sua pergunta', stopListening: 'Parar de ouvir', readAloud: 'Ler resposta em voz alta', stopReading: 'Parar de ler' },
    ops: { heading: 'Dia de jogo', preMatch: 'Início em', live: 'Ao vivo', postMatch: 'Fim de jogo', gatesHeading: 'Filas nos portões', gate: 'Portão', queue: '{min} min', weather: 'Clima', weatherClear: 'Limpo', weatherCloudy: 'Nublado', weatherRain: 'Chuva', quiet: 'Tranquilo', busy: 'Movimentado', packed: 'Lotado' },
    map: { heading: 'Mapa do estádio', tabChat: 'Chat', tabMap: 'Mapa', legendGate: 'Portão', legendSeat: 'Seu lugar', legendAmenity: 'Locais', legendRoute: 'Rota', summaryIdle: 'Mapa interativo do estádio. Faça uma pergunta para iluminar sua rota.', summaryRoute: 'Rota destacada de {from} até a seção {to}.', focus: 'Ver mapa do estádio', askSection: 'Como chego à seção {id}?', askGate: 'Fale sobre o Portão {id}.' },
    quickActions: {
      heading: 'Ajuda rápida',
      seat: { label: 'Encontrar meu lugar', query: 'Como chego ao meu lugar?' },
      food: { label: 'Comida e bebida', query: 'Onde fica a comida mais próxima?' },
      restroom: { label: 'Banheiros', query: 'Onde fica o banheiro mais próximo?' },
      accessible: { label: 'Rota sem degraus', query: 'Mostre uma rota sem degraus até o meu lugar.' },
      leave: { label: 'Sair do estádio', query: 'Como chego ao centro depois do jogo?' },
      firstAid: { label: 'Primeiros socorros', query: 'Onde fica o posto de primeiros socorros mais próximo?' },
      score: { label: 'Placar ao vivo', query: 'Como está o placar?' },
    },
    commandPalette: { open: 'Paleta de comandos', placeholder: 'Buscar ações…', empty: 'Nenhuma ação correspondente', groupAsk: 'Perguntar ao PitchPal', groupSettings: 'Configurações', changeLanguage: 'Mudar idioma', toggleTheme: 'Mudar tema', toggleReadAloud: 'Alternar leitura em voz alta', focusMap: 'Ver mapa do estádio' },
    onboarding: { title: 'Bem-vindo ao PitchPal', subtitle: 'Configure seu companheiro de jogo.', stepLanguage: 'Seu idioma', stepAccess: 'Acessibilidade', stepSeat: 'Seu lugar ou portão', next: 'Próximo', back: 'Voltar', finish: 'Começar', skip: 'Pular', step: 'Passo {n} de {total}' },
    dataNote: 'Usa dados de exemplo do estádio, não informações oficiais da FIFA.',
    standings: { heading: 'Classificação do grupo', played: 'J', points: 'Pts' },
    nav: { heading: 'Navegação principal', switcherHeading: 'Mudar de vista', home: 'Início', chat: 'Chat', map: 'Mapa', itinerary: 'Itinerário', more: 'Mais' },
    dashboard: { heading: 'Dia de jogo', heroLabel: 'Placar ao vivo', riskHeading: 'Risco nos portões', suggestedHeading: 'Sugerido para você', seeAll: 'Ver itinerário completo' },
    risk: { heading: 'Previsão de risco nos portões', rising: 'Subindo', falling: 'Caindo', steady: 'Estável', rerouteAsk: 'O Portão {gate} parece que vai ficar cheio — sugira uma rota alternativa.', rerouteCta: 'Pedir à IA uma rota alternativa', projectedIn: 'em {min} min' },
    suggestions: {
      kickoffSoonReason: 'O início é em breve — resolva o que precisar agora.',
      kickoffSoonQuery: 'Quais comodidades ficam perto do meu lugar antes do início?',
      gateJamReason: 'O Portão {gate} está ficando congestionado.',
      postMatchReason: 'O jogo terminou — planeje sua volta.',
      postMatchQuery: 'Como chego ao centro depois do jogo?',
      accessibleRouteReason: 'Aqui está uma rota mais tranquila e sem degraus.',
    },
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
    matchLabel: 'المباراة',
    suggestionsHeading: 'جرّب أن تسأل',
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
    retry: 'إعادة المحاولة',
    stop: 'إيقاف',
    install: 'تثبيت التطبيق',
    card: { from: 'من', to: 'إلى', walk: '{min} دقيقة سيرًا', stepFree: 'خالٍ من الدرج', notStepFree: 'به درج', accessible: 'مناسب لذوي الإعاقة', hours: 'ساعات العمل', frequency: 'التكرار' },
    theme: { label: 'المظهر', system: 'النظام', light: 'فاتح', dark: 'داكن' },
    offline: { badge: 'غير متصل', hint: 'لا يوجد اتصال — يتم إنشاء الإجابات على جهازك.' },
    voice: { listen: 'انطق سؤالك', stopListening: 'إيقاف الاستماع', readAloud: 'قراءة الإجابة بصوت عالٍ', stopReading: 'إيقاف القراءة' },
    ops: { heading: 'يوم المباراة', preMatch: 'انطلاق المباراة بعد', live: 'مباشر', postMatch: 'نهاية المباراة', gatesHeading: 'طوابير البوابات', gate: 'بوابة', queue: '{min} دقيقة', weather: 'الطقس', weatherClear: 'صافٍ', weatherCloudy: 'غائم', weatherRain: 'ممطر', quiet: 'هادئة', busy: 'مزدحمة', packed: 'مكتظة' },
    map: { heading: 'خريطة الملعب', tabChat: 'المحادثة', tabMap: 'الخريطة', legendGate: 'بوابة', legendSeat: 'مقعدك', legendAmenity: 'أماكن', legendRoute: 'المسار', summaryIdle: 'خريطة تفاعلية للملعب. اطرح سؤالًا لإظهار مسارك.', summaryRoute: 'المسار مميّز من {from} إلى القسم {to}.', focus: 'عرض خريطة الملعب', askSection: 'كيف أصل إلى القسم {id}؟', askGate: 'أخبرني عن البوابة {id}.' },
    quickActions: {
      heading: 'مساعدة سريعة',
      seat: { label: 'إيجاد مقعدي', query: 'كيف أصل إلى مقعدي؟' },
      food: { label: 'طعام وشراب', query: 'أين أقرب طعام؟' },
      restroom: { label: 'دورات المياه', query: 'أين أقرب دورة مياه؟' },
      accessible: { label: 'مسار خالٍ من الدرج', query: 'أرني مسارًا خاليًا من الدرج إلى مقعدي.' },
      leave: { label: 'مغادرة الملعب', query: 'كيف أصل إلى وسط المدينة بعد المباراة؟' },
      firstAid: { label: 'إسعافات أولية', query: 'أين أقرب نقطة إسعافات أولية؟' },
      score: { label: 'النتيجة مباشرة', query: 'ما النتيجة؟' },
    },
    commandPalette: { open: 'لوحة الأوامر', placeholder: 'ابحث عن إجراءات…', empty: 'لا توجد إجراءات مطابقة', groupAsk: 'اسأل PitchPal', groupSettings: 'الإعدادات', changeLanguage: 'تغيير اللغة', toggleTheme: 'تغيير المظهر', toggleReadAloud: 'تبديل القراءة الصوتية', focusMap: 'عرض خريطة الملعب' },
    onboarding: { title: 'مرحبًا بك في PitchPal', subtitle: 'اضبط رفيقك ليوم المباراة.', stepLanguage: 'لغتك', stepAccess: 'إمكانية الوصول', stepSeat: 'مقعدك أو بوابتك', next: 'التالي', back: 'السابق', finish: 'ابدأ', skip: 'تخطٍّ', step: 'الخطوة {n} من {total}' },
    dataNote: 'يستخدم بيانات ملعب نموذجية، وليست معلومات رسمية من الفيفا.',
    standings: { heading: 'ترتيب المجموعة', played: 'لعب', points: 'نقاط' },
    nav: { heading: 'التنقل الرئيسي', switcherHeading: 'تبديل العرض', home: 'الرئيسية', chat: 'المحادثة', map: 'الخريطة', itinerary: 'خطة اليوم', more: 'المزيد' },
    dashboard: { heading: 'يوم المباراة', heroLabel: 'النتيجة مباشرة', riskHeading: 'مخاطر البوابات', suggestedHeading: 'مقترح لك', seeAll: 'عرض خطة اليوم كاملة' },
    risk: { heading: 'توقعات مخاطر البوابات', rising: 'في ازدياد', falling: 'في انخفاض', steady: 'مستقرة', rerouteAsk: 'يبدو أن البوابة {gate} ستكون مزدحمة — اقترح مسارًا بديلًا.', rerouteCta: 'اطلب من الذكاء الاصطناعي مسارًا بديلًا', projectedIn: 'خلال {min} دقيقة' },
    suggestions: {
      kickoffSoonReason: 'الانطلاق قريب — احصل على ما تحتاجه الآن.',
      kickoffSoonQuery: 'ما المرافق القريبة من مقعدي قبل الانطلاق؟',
      gateJamReason: 'البوابة {gate} أصبحت مزدحمة.',
      postMatchReason: 'انتهت المباراة — خطط لعودتك.',
      postMatchQuery: 'كيف أصل إلى وسط المدينة بعد المباراة؟',
      accessibleRouteReason: 'إليك مسارًا أكثر هدوءًا وخاليًا من الدرج.',
    },
  },
};

/** Ordered quick-action keys for rendering. */
export const QUICK_ACTION_KEYS = ['seat', 'score', 'food', 'restroom', 'accessible', 'leave', 'firstAid'] as const;
export type QuickActionKey = (typeof QUICK_ACTION_KEYS)[number];

/** Localized labels shown while the agent runs a tool (from `status` events). */
export const TOOL_STATUS: Record<LanguageCode, Record<string, string>> = {
  en: {
    planRoute: 'Planning your route…',
    findAmenities: 'Finding places nearby…',
    getTransport: 'Checking transport…',
    getGateStatus: 'Checking gate queues…',
    getMatchStatus: 'Checking the score…',
    setFanTicket: 'Reading your ticket…',
    getSustainability: 'Finding the greenest route…',
    bookAccessibilityService: 'Booking your service…',
  },
  es: {
    planRoute: 'Planificando tu ruta…',
    findAmenities: 'Buscando lugares cercanos…',
    getTransport: 'Consultando el transporte…',
    getGateStatus: 'Revisando las colas de las puertas…',
    getMatchStatus: 'Consultando el marcador…',
    setFanTicket: 'Leyendo tu entrada…',
    getSustainability: 'Buscando la ruta más ecológica…',
    bookAccessibilityService: 'Reservando tu servicio…',
  },
  fr: {
    planRoute: 'Calcul de votre itinéraire…',
    findAmenities: 'Recherche de lieux à proximité…',
    getTransport: 'Vérification des transports…',
    getGateStatus: 'Vérification des files aux portes…',
    getMatchStatus: 'Vérification du score…',
    setFanTicket: 'Lecture de votre billet…',
    getSustainability: 'Recherche du trajet le plus vert…',
    bookAccessibilityService: 'Réservation de votre service…',
  },
  pt: {
    planRoute: 'Planejando sua rota…',
    findAmenities: 'Procurando lugares próximos…',
    getTransport: 'Verificando o transporte…',
    getGateStatus: 'Verificando as filas dos portões…',
    getMatchStatus: 'Verificando o placar…',
    setFanTicket: 'Lendo seu ingresso…',
    getSustainability: 'Buscando a rota mais verde…',
    bookAccessibilityService: 'Reservando seu serviço…',
  },
  ar: {
    planRoute: 'نخطط مسارك…',
    findAmenities: 'نبحث عن أماكن قريبة…',
    getTransport: 'نتحقق من المواصلات…',
    getGateStatus: 'نتحقق من طوابير البوابات…',
    getMatchStatus: 'نتحقق من النتيجة…',
    setFanTicket: 'نقرأ تذكرتك…',
    getSustainability: 'نبحث عن المسار الأكثر خضرة…',
    bookAccessibilityService: 'نحجز خدمتك…',
  },
};

export interface ScanStrings {
  button: string;
  query: string;
  invalid: string;
  scanning: string;
  hint: string;
  retake: string;
  use: string;
  cancel: string;
}

export interface ItineraryStrings {
  heading: string;
  arrive: string;
  gate: string; // {id}
  seat: string;
  kickoff: string;
  halftime: string;
  leave: string; // {transport}
  alertsEnable: string;
  alertsOn: string;
  alertsUnsupported: string;
  alertTitle: string;
  alertBody: string; // {gate}
  reorderHint: string;
  addStep: string;
  removeStep: string;
  dragHandleLabel: string; // {step}
  reminderToggle: string; // {step}
  reminderOn: string; // {step}
}

export interface AnalyticsStrings {
  heading: string;
  heatmap: string;
  crowd: string;
  queue: string; // {gate}
  low: string;
  medium: string;
  high: string;
  crowdSummary: string; // {pct}
  queueSummary: string; // {gate} {min}
}

/** Localized strings for the crowd heatmap + analytics strip. */
export const ANALYTICS: Record<LanguageCode, AnalyticsStrings> = {
  en: { heading: 'Live analytics', heatmap: 'Crowd heatmap', crowd: 'Stadium crowd', queue: 'Queue · Gate {gate}', low: 'Quiet', medium: 'Filling', high: 'Packed', crowdSummary: 'Stadium is {pct}% full and rising.', queueSummary: 'Busiest gate {gate}, about {min} min.' },
  es: { heading: 'Analíticas en vivo', heatmap: 'Mapa de calor', crowd: 'Público del estadio', queue: 'Cola · Puerta {gate}', low: 'Tranquilo', medium: 'Llenándose', high: 'Lleno', crowdSummary: 'El estadio está al {pct}% y subiendo.', queueSummary: 'Puerta más concurrida {gate}, unos {min} min.' },
  fr: { heading: 'Analyses en direct', heatmap: 'Carte de chaleur', crowd: 'Affluence du stade', queue: 'File · Porte {gate}', low: 'Calme', medium: 'Se remplit', high: 'Comble', crowdSummary: 'Le stade est rempli à {pct}% et augmente.', queueSummary: 'Porte la plus fréquentée {gate}, environ {min} min.' },
  pt: { heading: 'Análises ao vivo', heatmap: 'Mapa de calor', crowd: 'Público do estádio', queue: 'Fila · Portão {gate}', low: 'Tranquilo', medium: 'Enchendo', high: 'Lotado', crowdSummary: 'O estádio está {pct}% cheio e subindo.', queueSummary: 'Portão mais movimentado {gate}, cerca de {min} min.' },
  ar: { heading: 'تحليلات مباشرة', heatmap: 'خريطة حرارية', crowd: 'حضور الملعب', queue: 'الطابور · البوابة {gate}', low: 'هادئ', medium: 'يمتلئ', high: 'مكتظ', crowdSummary: 'الملعب ممتلئ بنسبة {pct}% وفي ازدياد.', queueSummary: 'أكثر البوابات ازدحامًا {gate}، حوالي {min} دقيقة.' },
};

/** Localized strings for the "My Match Day" itinerary + on-device gate alerts. */
export const ITINERARY: Record<LanguageCode, ItineraryStrings> = {
  en: {
    heading: 'My match day',
    arrive: 'Arrive at the stadium',
    gate: 'Head to Gate {id}',
    seat: 'Find your seat',
    kickoff: 'Kickoff',
    halftime: 'Half-time — grab a snack',
    leave: 'Leave via {transport}',
    alertsEnable: 'Enable gate alerts',
    alertsOn: 'Gate alerts on',
    alertsUnsupported: 'Notifications are not supported on this device.',
    alertTitle: 'PitchPal — gate alert',
    alertBody: 'Gate {gate} is getting busy. Consider heading over now.',
    reorderHint: 'Drag, or use arrow keys, to reorder your match-day steps.',
    addStep: 'Add a step',
    removeStep: 'Remove step',
    dragHandleLabel: 'Reorder {step}',
    reminderToggle: 'Remind me before {step}',
    reminderOn: 'Reminder set for {step}',
  },
  es: {
    heading: 'Mi día de partido',
    arrive: 'Llega al estadio',
    gate: 'Dirígete a la Puerta {id}',
    seat: 'Encuentra tu asiento',
    kickoff: 'Inicio del partido',
    halftime: 'Descanso — toma un tentempié',
    leave: 'Sal vía {transport}',
    alertsEnable: 'Activar alertas de puerta',
    alertsOn: 'Alertas de puerta activas',
    alertsUnsupported: 'Las notificaciones no son compatibles con este dispositivo.',
    alertTitle: 'PitchPal — alerta de puerta',
    alertBody: 'La Puerta {gate} se está llenando. Considera dirigirte ahora.',
    reorderHint: 'Arrastra, o usa las flechas del teclado, para reordenar tu día de partido.',
    addStep: 'Añadir un paso',
    removeStep: 'Eliminar paso',
    dragHandleLabel: 'Reordenar {step}',
    reminderToggle: 'Avísame antes de {step}',
    reminderOn: 'Recordatorio activado para {step}',
  },
  fr: {
    heading: 'Mon jour de match',
    arrive: 'Arrivez au stade',
    gate: 'Dirigez-vous vers la Porte {id}',
    seat: 'Trouvez votre place',
    kickoff: 'Coup d’envoi',
    halftime: 'Mi-temps — prenez une collation',
    leave: 'Partez via {transport}',
    alertsEnable: 'Activer les alertes de porte',
    alertsOn: 'Alertes de porte activées',
    alertsUnsupported: "Les notifications ne sont pas prises en charge sur cet appareil.",
    alertTitle: 'PitchPal — alerte de porte',
    alertBody: 'La Porte {gate} se remplit. Pensez à vous y rendre maintenant.',
    reorderHint: 'Faites glisser, ou utilisez les flèches du clavier, pour réorganiser votre jour de match.',
    addStep: 'Ajouter une étape',
    removeStep: "Supprimer l'étape",
    dragHandleLabel: 'Réorganiser {step}',
    reminderToggle: 'Me rappeler avant {step}',
    reminderOn: 'Rappel activé pour {step}',
  },
  pt: {
    heading: 'Meu dia de jogo',
    arrive: 'Chegue ao estádio',
    gate: 'Vá para o Portão {id}',
    seat: 'Encontre seu lugar',
    kickoff: 'Início do jogo',
    halftime: 'Intervalo — pegue um lanche',
    leave: 'Saia via {transport}',
    alertsEnable: 'Ativar alertas de portão',
    alertsOn: 'Alertas de portão ativos',
    alertsUnsupported: 'Notificações não são compatíveis com este dispositivo.',
    alertTitle: 'PitchPal — alerta de portão',
    alertBody: 'O Portão {gate} está enchendo. Considere ir para lá agora.',
    reorderHint: 'Arraste, ou use as setas do teclado, para reordenar seu dia de jogo.',
    addStep: 'Adicionar uma etapa',
    removeStep: 'Remover etapa',
    dragHandleLabel: 'Reordenar {step}',
    reminderToggle: 'Lembrar antes de {step}',
    reminderOn: 'Lembrete definido para {step}',
  },
  ar: {
    heading: 'يوم مباراتي',
    arrive: 'اصل إلى الملعب',
    gate: 'توجه إلى البوابة {id}',
    seat: 'ابحث عن مقعدك',
    kickoff: 'انطلاق المباراة',
    halftime: 'الاستراحة — تناول وجبة خفيفة',
    leave: 'غادر عبر {transport}',
    alertsEnable: 'تفعيل تنبيهات البوابة',
    alertsOn: 'تنبيهات البوابة مفعّلة',
    alertsUnsupported: 'الإشعارات غير مدعومة على هذا الجهاز.',
    alertTitle: 'PitchPal — تنبيه بوابة',
    alertBody: 'البوابة {gate} أصبحت مزدحمة. فكر في التوجه إليها الآن.',
    reorderHint: 'اسحب، أو استخدم أسهم لوحة المفاتيح، لإعادة ترتيب خطوات يوم مباراتك.',
    addStep: 'إضافة خطوة',
    removeStep: 'إزالة الخطوة',
    dragHandleLabel: 'إعادة ترتيب {step}',
    reminderToggle: 'ذكّرني قبل {step}',
    reminderOn: 'تم ضبط تذكير لـ {step}',
  },
};

/** Localized strings for the ticket-scan flow. */
export const SCAN_STRINGS: Record<LanguageCode, ScanStrings> = {
  en: { query: 'Scan my ticket and find my seat.', invalid: "We couldn't read that image — try a clear JPEG or PNG photo of your ticket.", button: 'Scan ticket', scanning: 'Reading your ticket…', hint: 'Snap or upload your ticket to auto-find your seat.', retake: 'Choose another', use: 'Find my seat', cancel: 'Cancel' },
  es: { query: 'Escanea mi entrada y encuentra mi asiento.', invalid: 'No pudimos leer esa imagen. Prueba con una foto clara de tu entrada en JPEG o PNG.', button: 'Escanear entrada', scanning: 'Leyendo tu entrada…', hint: 'Haz una foto o sube tu entrada para encontrar tu asiento.', retake: 'Elegir otra', use: 'Encontrar mi asiento', cancel: 'Cancelar' },
  fr: { query: 'Scanne mon billet et trouve ma place.', invalid: "Impossible de lire cette image — essayez une photo nette de votre billet en JPEG ou PNG.", button: 'Scanner le billet', scanning: 'Lecture de votre billet…', hint: 'Prenez ou importez votre billet pour trouver votre place.', retake: 'En choisir un autre', use: 'Trouver ma place', cancel: 'Annuler' },
  pt: { query: 'Escaneie meu ingresso e encontre meu lugar.', invalid: 'Não conseguimos ler essa imagem. Tente uma foto nítida do seu ingresso em JPEG ou PNG.', button: 'Escanear ingresso', scanning: 'Lendo seu ingresso…', hint: 'Tire uma foto ou envie seu ingresso para achar seu lugar.', retake: 'Escolher outro', use: 'Encontrar meu lugar', cancel: 'Cancelar' },
  ar: { query: 'امسح تذكرتي واعثر على مقعدي.', invalid: 'تعذّرت قراءة هذه الصورة — جرّب صورة واضحة لتذكرتك بصيغة JPEG أو PNG.', button: 'مسح التذكرة', scanning: 'نقرأ تذكرتك…', hint: 'صوّر أو ارفع تذكرتك للعثور على مقعدك تلقائيًا.', retake: 'اختر أخرى', use: 'اعثر على مقعدي', cancel: 'إلغاء' },
};
