const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STATE_KEY = process.env.LIFE_OS_STATE_KEY || "primary";

function missingConfig() {
  return new Response(
    JSON.stringify({
      error: "Sync is not configured yet.",
      needs: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
    }),
    { status: 503, headers: { "content-type": "application/json" } }
  );
}

async function supabase(path, init = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  const isLegacyJwt = SUPABASE_SERVICE_ROLE_KEY.split(".").length === 3;
  const headers = new Headers(init.headers || {});
  headers.set("apikey", SUPABASE_SERVICE_ROLE_KEY);
  headers.set("content-type", "application/json");
  if (isLegacyJwt) headers.set("authorization", `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`);

  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers
  });
}

export async function GET() {
  const response = await supabase(`life_os_state?key=eq.${encodeURIComponent(STATE_KEY)}&select=state,updated_at`);
  if (!response) return missingConfig();
  if (!response.ok) {
    return new Response(await response.text(), { status: response.status });
  }
  const rows = await response.json();
  return Response.json(rows[0] || { state: null, updated_at: null });
}

export async function PUT(request) {
  const body = await request.json();
  const state = body?.state;
  if (!state || typeof state !== "object") {
    return Response.json({ error: "Expected a state object." }, { status: 400 });
  }
  const response = await supabase("life_os_state?on_conflict=key", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      key: STATE_KEY,
      state,
      updated_at: new Date().toISOString()
    })
  });
  if (!response) return missingConfig();
  if (!response.ok) {
    return new Response(await response.text(), { status: response.status });
  }
  const rows = await response.json();
  return Response.json(rows[0]);
}
