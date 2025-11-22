// The /// <reference types="vite/client" /> directive was removed because the type
// definition file could not be found, which is typically a project setup issue.
// The types for `import.meta.env` were also removed as they are unused in the
// application and depend on the Vite client types.

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
