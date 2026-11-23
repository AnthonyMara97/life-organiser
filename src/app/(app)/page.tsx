import { redirect } from "next/navigation";

// `/` is only a doorway. The dashboard lives at `/dashboard`, the route fixed by
// §6 of the architecture doc; this page keeps a bare domain or an old bookmark
// landing somewhere real. The `(app)` layout has already checked the session.
export default function Home() {
  redirect("/dashboard");
}
