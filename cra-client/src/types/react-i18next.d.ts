import 'react-i18next';

// This is a temporary solution to ignore TypeScript errors with react-i18next
declare module 'react-i18next' {
  export interface UseTranslationResponse {
    t: (key: string, options?: any) => string;
    i18n: {
      changeLanguage: (lng: string) => Promise<void>;
      language: string;
    };
  }

  export function useTranslation(): UseTranslationResponse;
}
