const en = {
  'app.title': 'Oman Gold Tracker',
  'app.tagline': 'Live gold prices in Omani Rial',
  'app.switchLanguage': 'العربية',
  'nav.prices': 'Prices',
  'nav.calculator': 'Calculator',
  'nav.portfolio': 'Portfolio',
  'nav.alerts': 'Alerts',
  'footer.source': 'Spot price from gold-api.com, converted at the official peg 1 USD = 0.3845 OMR.',
  'footer.disclaimer': 'Indicative prices only. Shop prices include making charges and may differ.',
} as const;

export type TranslationKey = keyof typeof en;
export type Lang = 'ar' | 'en';

const ar: Record<TranslationKey, string> = {
  'app.title': 'متتبع الذهب العماني',
  'app.tagline': 'أسعار الذهب لحظة بلحظة بالريال العماني',
  'app.switchLanguage': 'English',
  'nav.prices': 'الأسعار',
  'nav.calculator': 'الحاسبة',
  'nav.portfolio': 'محفظتي',
  'nav.alerts': 'التنبيهات',
  'footer.source': 'السعر الفوري من gold-api.com، محوّل بسعر الربط الرسمي 1 دولار = 0.3845 ريال.',
  'footer.disclaimer': 'الأسعار استرشادية فقط. أسعار المحلات تشمل المصنعية وقد تختلف.',
};

export const TRANSLATIONS: Record<Lang, Record<TranslationKey, string>> = { en, ar };
