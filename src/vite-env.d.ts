/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_TRANSLATE_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 