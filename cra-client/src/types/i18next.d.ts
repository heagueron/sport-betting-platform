import 'react-i18next';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: {
        header: {
          home: string;
          aboutUs: string;
          login: string;
          signup: string;
          logout: string;
        };
        home: {
          hero: {
            title: string;
            description: string;
            ctaButton: string;
          };
          upcomingEvents: {
            title: string;
            viewButton: string;
          };
          sports: {
            football: string;
            basketball: string;
            tennis: string;
            horseRacing: string;
          };
        };
        sports: {
          title: string;
          description: string;
          events: string;
          viewEvents: string;
        };
        events: {
          title: string;
          description: string;
          placeBet: string;
          viewDetails: string;
          draw: string;
        };
        about: {
          title: string;
          description: string;
        };
        footer: {
          description: string;
          quickLinks: string;
          legal: string;
          termsOfService: string;
          privacyPolicy: string;
          responsibleGambling: string;
          contact: string;
          copyright: string;
        };
        common: {
          loading: string;
          error: string;
          retry: string;
          save: string;
          cancel: string;
          confirm: string;
          delete: string;
          edit: string;
          view: string;
          search: string;
          filter: string;
          sort: string;
          language: string;
          spanish: string;
          english: string;
        };
      };
    };
  }
}
