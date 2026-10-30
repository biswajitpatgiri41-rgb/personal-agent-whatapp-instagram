# Instagram setup

Use Meta's official Instagram Messaging API for an eligible Creator or Business account. Configure the app, account/page permissions, access token, webhook subscription, and `/api/webhooks/instagram` callback. Set `INSTAGRAM_ACCOUNT_ID`, API version, app secret, and verify token.

The webhook validates `X-Hub-Signature-256`, ignores echo messages, deduplicates by message MID, and sends text replies through the Graph API. Instagram permissions, message windows, account review, and human-agent rules are controlled by Meta.
