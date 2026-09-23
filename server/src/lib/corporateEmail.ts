export const BAJAJ_AUTO_EMAIL_DOMAIN = '@bajajauto.co.in';

export function isBajajAutoEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.length > BAJAJ_AUTO_EMAIL_DOMAIN.length
    && normalized.endsWith(BAJAJ_AUTO_EMAIL_DOMAIN);
}

export const corporateEmailWhere = {
  endsWith: BAJAJ_AUTO_EMAIL_DOMAIN,
  mode: 'insensitive' as const,
};
