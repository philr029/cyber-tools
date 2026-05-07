const EMAIL_REGEX = /^(?!.*\.\.)([a-z0-9._%+-]+)@([a-z0-9-]+\.)+[a-z]{2,63}$/i;
const DISPLAY_NAME_REGEX = /^(?=.{2,60}$)[a-z]+(?:[ '\-][a-z]+)*$/i;
const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i;
const IPV4_REGEX = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function isValidDisplayName(value) {
  return DISPLAY_NAME_REGEX.test(value.trim());
}

export function isValidEmail(value) {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidActiveTarget(value) {
  const target = value.trim();
  return DOMAIN_REGEX.test(target) || IPV4_REGEX.test(target) || URL_REGEX.test(target);
}
