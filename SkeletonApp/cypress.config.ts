import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    includeShadowDom: true,
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.spec.{js,ts}',
    supportFile: 'cypress/support/e2e.ts',
  },
});
