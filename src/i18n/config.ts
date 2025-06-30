import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./en/translations.json";
import ptBrTranslation from "./pt-br/translations.json";
import esTranslation from "./es/translations.json";

export enum Language {
    EN = "en",
    PT_BR = "ptBr",
    ES = "es",
}

i18next.use(initReactI18next).init({
    debug: import.meta.env.PROD ? false : true,
    resources: {
        [Language.EN]: {
            translation: enTranslation,
        },
        [Language.PT_BR]: {
            translation: ptBrTranslation,
        },
        [Language.ES]: {
            translation: esTranslation,
        },
    },
    // Default language
    lng: Language.EN,
    fallbackLng: Language.EN,
    interpolation: {
        escapeValue: false,
    },
});
