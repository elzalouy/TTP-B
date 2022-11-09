import i18n from "../startup/i18n/config";

export const localize = (key: string) => {
  return i18n.__(key);
};
