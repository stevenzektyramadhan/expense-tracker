import { isAllowedMutationOrigin } from "@/lib/mutationSecurity.mjs";

export function requireAllowedMutationOrigin(request, authMethod) {
  if (
    isAllowedMutationOrigin({
      authMethod,
      origin: request.headers.get("origin"),
      appOrigin: process.env.APP_ORIGIN,
    })
  ) {
    return null;
  }

  return Response.json({ error: "Forbidden origin" }, { status: 403 });
}
