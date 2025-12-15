declare namespace Cypress {
  interface Chainable {
    login(): Chainable<void>; // Declara o comando `login` com o tipo correto
  }
}
