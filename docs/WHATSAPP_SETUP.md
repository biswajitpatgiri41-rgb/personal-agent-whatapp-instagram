# WhatsApp setup

Use the official WhatsApp Business Platform Cloud API. Create a Meta business portfolio, WhatsApp account, business app, business phone number, and access token with the required permissions. Configure the webhook URL `/api/webhooks/whatsapp`, the verify token, and subscribe to message/status fields.

The webhook validates `X-Hub-Signature-256` using `WHATSAPP_APP_SECRET`, deduplicates by message ID, and sends text replies through `/{PHONE_NUMBER_ID}/messages`. Customer-service windows, approved templates, opt-in, and Meta pricing still apply. An ordinary personal WhatsApp account is not supported by this integration.
