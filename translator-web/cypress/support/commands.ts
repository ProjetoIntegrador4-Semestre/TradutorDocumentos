import 'cypress-file-upload';

Cypress.Commands.add("login", () => {
  cy.request({
    method: "POST",
    url: "https://tradudoc.duckdns.org/api/auth/signin",
    body: {
      email: "admin@admin.com",
      password: "admin",
    },
    failOnStatusCode: false,
  }).then((resp) => {
    if (resp.status === 200) {
      const token = resp.body.accessToken;
      window.localStorage.setItem("access_token", token);
    } else {
      cy.log("LOGIN FALHOU:", resp.status);
      cy.log("Body:", JSON.stringify(resp.body));
    }
  });
});

