/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // podés agregar más variables acá
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
