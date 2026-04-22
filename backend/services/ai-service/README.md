# AI Service (scaffold)

This microservice centralizes AI functionality for the platform: NLU parsing, itinerary generation, embeddings/recommendations, and conversational booking queries.

Routes (scaffold):

- POST /v1/parse — { text }
- POST /v1/itinerary — structured preferences
- POST /v1/recommendations — { text | userId }
- GET/POST /v1/booking-status — { userId }

Notes:
- Current implementation supports a real OpenAI adapter in `internal/llm/openai.go`. Set `LLM_API_KEY` and `LLM_PROVIDER=openai` (see `.env.example`).
- A `MockClient` fallback is used when no API key is provided.
- Update `DESTINATION_SERVICE_URL` and `BOOKING_SERVICE_URL` in environment to point to other services.
