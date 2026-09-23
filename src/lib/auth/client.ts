export { GROK_PROVIDERS } from "./providers";
import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

export const authEnabled = String(import.meta.env.VITE_AUTH_ENABLED ?? "true") === "true";
export const authClient = createAuthClient({ plugins: [genericOAuthClient()] });

export async function signIn(providerId: string, opts: { callbackURL?: string; errorCallbackURL?: string } = {}) {
  const callbackURL = opts.callbackURL ?? "/";
  const errorCallbackURL = opts.errorCallbackURL ?? "/";
  if (providerId === "google") {
    const { data, error } = await authClient.signIn.social({ provider: "google", callbackURL, errorCallbackURL });
    if (error) throw new Error(error.message ?? "Sign-in failed");
    if (data?.url) window.location.href = data.url;
    return;
  }
  const { data, error } = await authClient.signIn.oauth2({ providerId, callbackURL, errorCallbackURL });
  if (error) throw new Error(error.message ?? "Sign-in failed");
  if (data?.url) window.location.href = data.url;
}
