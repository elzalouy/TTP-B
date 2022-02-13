import i18n from "i18n";
import path from 'path'
i18n.configure({
  defaultLocale: "ar",
  directory: path.join(__dirname, '/locales'),
  locales: ["en", "ar"],
});

export default i18n