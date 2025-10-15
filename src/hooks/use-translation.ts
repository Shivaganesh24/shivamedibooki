import { useLanguage } from '@/context/language-context';

export function useTranslation() {
  const { translations } = useLanguage();

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return { t };
}
