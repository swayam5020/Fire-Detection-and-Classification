/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the FastAPI backend, e.g. http://localhost:8000. */
  readonly VITE_API_BASE_URL?: string;
  /** "false" switches cluster data to the live API; anything else keeps mocks. */
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
