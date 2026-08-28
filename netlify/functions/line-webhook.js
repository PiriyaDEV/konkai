const crypto = require("crypto");

const COMMAND = "/ขนไก่";
const APP_URL = "https://konkai.netlify.app";

function verifySignature(rawBody, signature, secret) {
  if (!signature) return false;
  const expected = crypto.createHmac("SHA256", secret).update(rawBody).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function idFromSource(source) {
  if (source.type === "group") return source.groupId;
  if (source.type === "room") return source.roomId;
  return source.userId;
}

async function replyMessage(replyToken, text) {
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
  });
  if (!res.ok) {
    console.error("LINE reply failed", res.status, await res.text());
  }
}

exports.handler = async (event) => {
  const secret = process.env.CHANNEL_SECRET;
  const rawBody = event.body || "";
  const signature = event.headers["x-line-signature"] || event.headers["X-Line-Signature"];

  if (!secret || !verifySignature(rawBody, signature, secret)) {
    return { statusCode: 401, body: "invalid signature" };
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { statusCode: 400, body: "bad request" };
  }

  const events = payload.events || [];

  await Promise.all(
    events.map(async (e) => {
      if (e.type !== "message" || e.message?.type !== "text") return;
      if (e.message.text.trim() !== COMMAND) return;

      const id = idFromSource(e.source);
      const link = `${APP_URL}/group?group=${encodeURIComponent(id)}`;
      const text = `สวัสดีครับพี่ๆนักตีแบต! มาตีแบตกันเถอะ ${link}`;
      await replyMessage(e.replyToken, text);
    })
  );

  return { statusCode: 200, body: "OK" };
};
