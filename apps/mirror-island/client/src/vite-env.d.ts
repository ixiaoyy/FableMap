/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MEDIA_BASE_URL?: string;
  readonly VITE_MAP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
