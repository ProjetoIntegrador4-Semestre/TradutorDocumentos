describe('TranslatorPage', () => {

  beforeEach(() => {
    cy.login();
    cy.visit('/tradutor', { failOnStatusCode: false });
  });

  it('Testes para permitir selecionar um arquivo', () => {
    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.contains('Selecionado: sample.pdf').should('exist');
  });

  it('Testes para manter o botão Traduzir desabilitado sem arquivo', () => {
    cy.get('[data-testid="translate-button"]').should('be.disabled');
  });

  it('Testes para realizar a tradução com sucesso', () => {
    cy.intercept('POST', 'https://tradudoc.duckdns.org/translate-file', {
      statusCode: 200,
      fixture: 'translated.pdf',
      headers: { 'content-type': 'application/pdf' }
    }).as('translateFile');

    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.get('[data-testid="translate-button"]').click();
    cy.wait('@translateFile');

    cy.contains('Tradução concluída').should('exist');
  });

  it('Testes para exibir o preview do PDF após tradução', () => {
    cy.intercept('POST', 'https://tradudoc.duckdns.org/translate-file', {
      statusCode: 200,
      fixture: 'translated.pdf',
      headers: { 'content-type': 'application/pdf' }
    }).as('translateFile');

    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.get('[data-testid="translate-button"]').click();
    cy.wait('@translateFile');

    cy.get('iframe[title="Pré-visualização do PDF"]').should('exist');
  });

  it('Testes para permitir trocar o idioma de destino', () => {
    cy.intercept('GET', '**/languages').as('langs');
    cy.wait('@langs');

    cy.get('.MuiSelect-select').click();
    cy.contains('li', 'English (en)').click();
    cy.get('.MuiSelect-select').should('contain.text', 'English (en)');
  });

  it('Testes para abrir o PDF traduzido em nova aba', () => {
    cy.intercept('POST', 'https://tradudoc.duckdns.org/translate-file', {
      statusCode: 200,
      fixture: 'translated.pdf',
      headers: { 'content-type': 'application/pdf' }
    }).as('translateFile');

    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.get('[data-testid="translate-button"]').click();
    cy.wait('@translateFile');

    cy.contains('button', 'Abrir em nova aba').should('exist').and('be.visible');

    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.contains('button', 'Abrir em nova aba').click();
    cy.get('@windowOpen').should('have.been.calledOnce');
  });

  it('Testes para fazer o download do arquivo traduzido', () => {
    cy.intercept('POST', 'https://tradudoc.duckdns.org/translate-file', {
      statusCode: 200,
      fixture: 'translated.pdf',
      headers: { 
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="translated_sample.pdf"'
      }
    }).as('translateFile');

    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.get('[data-testid="translate-button"]').click();
    cy.wait('@translateFile');

    cy.contains('button', 'Baixar').should('exist').and('be.visible');

    cy.contains('button', 'Baixar').click();

    cy.window().its('document').then((doc) => {

      expect(doc.querySelector('a[download]')).to.not.exist;
    });
  });

  it('Testes para fazer o download de arquivo traduzido não-PDF', () => {
    cy.intercept('POST', 'https://tradudoc.duckdns.org/translate-file', {
      statusCode: 200,
      body: 'Conteúdo traduzido do documento',
      headers: { 
        'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'content-disposition': 'attachment; filename="translated_document.docx"'
      }
    }).as('translateFile');

    cy.get('input[type="file"]').attachFile('sample.docx');
    cy.get('[data-testid="translate-button"]').click();
    cy.wait('@translateFile');

    cy.contains('O arquivo foi traduzido com sucesso').should('exist');
    cy.contains('button', 'Baixar arquivo traduzido').should('exist').and('be.visible');

    cy.contains('button', 'Baixar arquivo traduzido').click();
  });

  it('Testes para verificar que o iframe carrega o PDF corretamente', () => {
    cy.intercept('POST', 'https://tradudoc.duckdns.org/translate-file', {
      statusCode: 200,
      fixture: 'translated.pdf',
      headers: { 'content-type': 'application/pdf' }
    }).as('translateFile');

    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.get('[data-testid="translate-button"]').click();
    cy.wait('@translateFile');

    cy.get('iframe[title="Pré-visualização do PDF"]')
      .should('exist')
      .and('have.attr', 'src')
      .and('include', 'blob:');
  });

  it('Testes para limpar resultado ao clicar em "Nova tradução"', () => {
    cy.intercept('POST', 'https://tradudoc.duckdns.org/translate-file', {
      statusCode: 200,
      fixture: 'translated.pdf',
      headers: { 'content-type': 'application/pdf' }
    }).as('translateFile');

    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.get('[data-testid="translate-button"]').click();
    cy.wait('@translateFile');

    cy.get('iframe[title="Pré-visualização do PDF"]').should('exist');

    cy.contains('button', 'Nova tradução').click();

    cy.get('iframe[title="Pré-visualização do PDF"]').should('not.exist');
    cy.contains('Aguardando arquivo').should('exist');
  });

  it('Testes para fechar o preview ao clicar em "Fechar"', () => {
    cy.intercept('POST', 'https://tradudoc.duckdns.org/translate-file', {
      statusCode: 200,
      fixture: 'translated.pdf',
      headers: { 'content-type': 'application/pdf' }
    }).as('translateFile');

    cy.get('input[type="file"]').attachFile('sample.pdf');
    cy.get('[data-testid="translate-button"]').click();
    cy.wait('@translateFile');

    cy.get('iframe[title="Pré-visualização do PDF"]').should('exist');

    cy.contains('button', 'Fechar').click();

    cy.get('iframe[title="Pré-visualização do PDF"]').should('not.exist');
  });

});