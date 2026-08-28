const crypto = require("crypto");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = "Sheet1!A:C";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

let cachedToken = null; // { accessToken, expiresAt } — reused across warm invocations

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function getCredentials() {
  const json = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64, "base64").toString("utf8");
  return JSON.parse(json);
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30000) {
    return cachedToken.accessToken;
  }
  const { client_email, private_key } = getCredentials();
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: client_email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).end().sign(private_key, "base64");
  const jwt = `${unsigned}.${signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`token request failed: ${JSON.stringify(data)}`);

  cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.accessToken;
}

async function sheetsFetch(path, options = {}) {
  const token = await getAccessToken();
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`sheets api error: ${JSON.stringify(data)}`);
  return data;
}

async function readRows() {
  const data = await sheetsFetch(`/values/${encodeURIComponent(RANGE)}`);
  return data.values || [];
}

async function ensureHeader(rows) {
  if (rows.length > 0 && rows[0][0] === "group_id") return;
  await sheetsFetch(`/values/${encodeURIComponent("Sheet1!A1:C1")}?valueInputOption=RAW`, {
    method: "PUT",
    body: JSON.stringify({ values: [["group_id", "updated_at", "state_json"]] }),
  });
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } };
  }

  try {
    if (event.httpMethod === "GET") {
      const groupId = event.queryStringParameters?.group;
      if (!groupId) return json(400, { error: "missing group" });

      const rows = await readRows();
      const row = rows.find((r) => r[0] === groupId);
      return json(200, { state: row ? JSON.parse(row[2]) : null });
    }

    if (event.httpMethod === "POST") {
      const { group, state } = JSON.parse(event.body || "{}");
      if (!group || !state) return json(400, { error: "missing group or state" });

      const rows = await readRows();
      await ensureHeader(rows);

      const rowIndex = rows.findIndex((r) => r[0] === group);
      const now = new Date().toISOString();
      const values = [[group, now, JSON.stringify(state)]];

      if (rowIndex > 0 || (rowIndex === 0 && rows[0][0] !== "group_id")) {
        const sheetRow = rowIndex + 1;
        await sheetsFetch(`/values/${encodeURIComponent(`Sheet1!A${sheetRow}:C${sheetRow}`)}?valueInputOption=RAW`, {
          method: "PUT",
          body: JSON.stringify({ values }),
        });
      } else {
        await sheetsFetch(`/values/${encodeURIComponent("Sheet1!A:C")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
          method: "POST",
          body: JSON.stringify({ values }),
        });
      }

      return json(200, { ok: true });
    }

    return json(405, { error: "method not allowed" });
  } catch (err) {
    console.error(err);
    return json(500, { error: String(err.message || err) });
  }
};
