# Gemini setup

Set `GEMINI_API_KEY`, `GEMINI_BASE_URL`, `GEMINI_MODEL`, and `GEMINI_API_FORMAT=native` for Google's generateContent endpoint. For an OpenAI-compatible gateway, use `GEMINI_API_FORMAT=openai`, a base URL whose `/chat/completions` endpoint is available, and the compatible model name. The provider has timeouts, bounded retries for 429/5xx, JSON schema validation, and token limits.
