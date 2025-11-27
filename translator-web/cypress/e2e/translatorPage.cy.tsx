describe('TranslatorPage', () => {

  beforeEach(() => {
    cy.login();
    cy.visit('/tradutor');
  });

  it('deve exibir o título "Traduzir Documento"', () => {
    cy.get('h4').should('contain.text', 'Traduzir Documento');
  });

  it('deve permitir selecionar um arquivo', () => {
    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.contains('Selecionado: sample.pdf').should('exist');
  });

  it('deve manter o botão Traduzir desabilitado sem arquivo', () => {
    cy.get('[data-testid="translate-button"]').should('be.disabled');
  });

  // ✔ SUCESSO NA TRADUÇÃO
  it('deve realizar a tradução com sucesso', () => {
    cy.intercept('POST', 'http://localhost:8080/translate-file', {
      statusCode: 200,
      fixture: 'translated.pdf',
      headers: { 'content-type': 'application/pdf' }
    }).as('translateFile');

    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.get('[data-testid="translate-button"]').click();
    cy.wait('@translateFile');

    cy.contains('Tradução concluída').should('exist');
  });

  // ✔ PREVIEW DO PDF
  it('deve exibir o preview do PDF após tradução', () => {
    cy.intercept('POST', 'http://localhost:8080/translate-file', {
      statusCode: 200,
      fixture: 'translated.pdf',
      headers: { 'content-type': 'application/pdf' }
    }).as('translateFile');

    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.get('[data-testid="translate-button"]').click();
    cy.wait('@translateFile');

    cy.get('iframe[title="Pré-visualização do PDF"]').should('exist');
  });

  it('deve permitir trocar o idioma de destino', () => {
  // Aguarda a API de línguas
  cy.intercept('GET', '**/languages').as('langs');
  cy.wait('@langs');

  // Clica no select (abre o menu de idiomas)
  cy.get('.MuiSelect-select').click();

  // Seleciona o idioma English (en)
  cy.contains('li', 'English (en)').click();

  // Verifica se o Select realmente mudou
  cy.get('.MuiSelect-select').should('contain.text', 'English (en)');
});


});
