import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'https://develop.dosskyq5aktr1.amplifyapp.com',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
