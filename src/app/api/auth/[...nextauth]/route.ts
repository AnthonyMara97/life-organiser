import { handlers } from "@/lib/auth";

// Auth.js owns every route below /api/auth: the provider handshake, the Google
// callback and the session endpoint. Handing it the raw handlers keeps the
// route file free of logic that belongs in src/lib/auth.ts.
export const { GET, POST } = handlers;
