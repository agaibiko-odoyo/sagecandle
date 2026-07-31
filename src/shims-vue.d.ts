/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.jpeg' {
  const source: string;
  export default source;
}

declare module '*.webp' {
  const source: string;
  export default source;
}
