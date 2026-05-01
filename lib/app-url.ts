const defaultPublicBaseUrl = "http://192.168.1.57:3000";

export function getPublicBaseUrl() {
  const raw = process.env.PUBLIC_BASE_URL?.trim() || defaultPublicBaseUrl;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getParticipantJoinUrl(joinCode: string) {
  return `${getPublicBaseUrl()}/session/${joinCode}`;
}
