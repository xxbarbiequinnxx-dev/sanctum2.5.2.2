import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <main style={{padding:24,fontFamily:"sans-serif"}}>
      <h1>Sanctum</h1>
      <p>Source on GitHub is incomplete. Upload the full unzipped Sanctum-vercel-upload.zip so src/, migrations/, and public/ are on main.</p>
    </main>
  ),
});
