import type { LanguageCode } from '../../features/context/types';
import type { ScanStrings } from './types';

/** Localized strings for the ticket-scan flow. */
export const SCAN_STRINGS: Record<LanguageCode, ScanStrings> = {
  en: { query: 'Scan my ticket and find my seat.', invalid: "We couldn't read that image — try a clear JPEG or PNG photo of your ticket.", button: 'Scan ticket', scanning: 'Reading your ticket…', hint: 'Snap or upload your ticket to auto-find your seat.', retake: 'Choose another', use: 'Find my seat', cancel: 'Cancel' },
  es: { query: 'Escanea mi entrada y encuentra mi asiento.', invalid: 'No pudimos leer esa imagen. Prueba con una foto clara de tu entrada en JPEG o PNG.', button: 'Escanear entrada', scanning: 'Leyendo tu entrada…', hint: 'Haz una foto o sube tu entrada para encontrar tu asiento.', retake: 'Elegir otra', use: 'Encontrar mi asiento', cancel: 'Cancelar' },
  fr: { query: 'Scanne mon billet et trouve ma place.', invalid: "Impossible de lire cette image — essayez une photo nette de votre billet en JPEG ou PNG.", button: 'Scanner le billet', scanning: 'Lecture de votre billet…', hint: 'Prenez ou importez votre billet pour trouver votre place.', retake: 'En choisir un autre', use: 'Trouver ma place', cancel: 'Annuler' },
  pt: { query: 'Escaneie meu ingresso e encontre meu lugar.', invalid: 'Não conseguimos ler essa imagem. Tente uma foto nítida do seu ingresso em JPEG ou PNG.', button: 'Escanear ingresso', scanning: 'Lendo seu ingresso…', hint: 'Tire uma foto ou envie seu ingresso para achar seu lugar.', retake: 'Escolher outro', use: 'Encontrar meu lugar', cancel: 'Cancelar' },
  ar: { query: 'امسح تذكرتي واعثر على مقعدي.', invalid: 'تعذّرت قراءة هذه الصورة — جرّب صورة واضحة لتذكرتك بصيغة JPEG أو PNG.', button: 'مسح التذكرة', scanning: 'نقرأ تذكرتك…', hint: 'صوّر أو ارفع تذكرتك للعثور على مقعدك تلقائيًا.', retake: 'اختر أخرى', use: 'اعثر على مقعدي', cancel: 'إلغاء' },
};
