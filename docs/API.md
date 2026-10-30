# API

`GET /api/health` returns configuration health without secrets.

`GET/POST /api/webhooks/whatsapp` implements Meta verification and signed inbound events.

`GET/POST /api/webhooks/instagram` implements Meta verification and signed inbound events.

`POST /api/queue/process` processes queued normalized events. Production requests require valid QStash signatures; production inline queue processing is disabled.
