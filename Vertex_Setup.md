# Vertex AI Setup

1. Enable **Vertex AI API** in Google Cloud Console.
2. Create a Service Account with **Vertex AI User** role.
3. Save the JSON key as `backend/service-account.json`.
4. Add `GOOGLE_APPLICATION_CREDENTIALS="service-account.json"` to your `.env` file.