export function bootstrapOAuth(): void {
  const hash = window.location.hash?.replace(/^#/, "") || "";
  const h = new URLSearchParams(hash);
  const q = new URLSearchParams(window.location.search);

  const candidates = [
    h.get("access_token"), q.get("access_token"),
    h.get("token"),        q.get("token"),
    h.get("jwt"),          q.get("jwt"),
    h.get("id_token"),     q.get("id_token"),
  ].filter(Boolean) as string[];

  let token = candidates.find(Boolean);
  if (!token) return;

  token = token.replace(/^"+|"+$/g, "").trim();
  localStorage.setItem("access_token", token);

  // limpa a URL e manda direto para /tradutor
  window.history.replaceState(null, "", "/tradutor");
}
