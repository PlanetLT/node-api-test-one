import path from "path";
import { fileURLToPath } from "url";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "my"],
    initImmediate: false,
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: path.resolve(__dirname, "../locales/{{lng}}.json"),
    },
    detection: {
      order: ["header", "querystring", "cookie"],
      lookupHeader: "accept-language",
      lookupQuerystring: "lang",
      lookupCookie: "i18next",
      caches: ["cookie"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
