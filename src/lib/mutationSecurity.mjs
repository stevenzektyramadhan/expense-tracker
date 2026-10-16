export function selectAuthenticatedUser(bearerUser, cookieUser) {
  if (bearerUser) return { authMethod: "bearer", user: bearerUser };
  if (cookieUser) return { authMethod: "cookie", user: cookieUser };
  return null;
}

export function isAllowedMutationOrigin({ authMethod, origin, appOrigin }) {
  if (authMethod === "bearer") return true;
  if (authMethod !== "cookie" || !origin || origin === "null" || !appOrigin) return false;

  try {
    if (new URL(origin).origin !== origin) return false;
  } catch {
    return false;
  }

  return appOrigin
    .split(",")
    .map((allowedOrigin) => allowedOrigin.trim())
    .filter(Boolean)
    .includes(origin);
}
