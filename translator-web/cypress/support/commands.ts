import 'cypress-file-upload';

Cypress.Commands.add("login", () => {
  cy.request({
    method: "POST",
    url: "http://100.30.34.113:8080/api/auth/signin",
    body: {
      email: "teste1@example.com",
      password: "12345678",
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

