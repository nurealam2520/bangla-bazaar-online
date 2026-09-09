/// <reference types="vite/client" />
/// <reference types="vite-imagetools/client" />

declare module "*&as=srcset" {
  const srcset: string;
  export default srcset;
}

declare module "*&quality=70" {
  const src: string;
  export default src;
}

