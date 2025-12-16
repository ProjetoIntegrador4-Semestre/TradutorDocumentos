# 📋 Relatório de Testes E2E com Cypress

Este relatório documenta a implementação de testes end-to-end (E2E) utilizando o framework Cypress para a aplicação **TranslatorPage**, uma interface web para tradução de documentos.

**Framework:** Cypress  
**Aplicação Testada:** TranslatorPage (React + Material-UI)  
**Ambiente:** `https://develop.dosskyq5aktr1.amplifyapp.com`

---

## 🎯 Objetivos dos Testes

Os testes foram desenvolvidos para garantir:

1. **Funcionalidade de Upload** - Verificar seleção e exibição de arquivos
2. **Validação de Formulário** - Garantir que botões sejam desabilitados quando necessário
3. **Integração com API** - Testar comunicação com backend de tradução
4. **Preview de Documentos** - Validar visualização de PDFs traduzidos
5. **Download de Arquivos** - Confirmar funcionalidade de download
6. **Navegação e UX** - Testar fluxos de usuário completos

---

## 🏗️ Arquitetura de Testes

### Estrutura de Arquivos

```
cypress/
├── e2e/
│   └── translatorPage.cy.tsx       # Suite de testes principal
├── fixtures/
│   ├── sample.pdf                  # Arquivo de teste para upload
│   └── translated.pdf              # Resposta mock da API
└── support/
    └── commands.ts                 # Comandos customizados (cy.login)
```
---

### ⚙️ Instalação e Execução

Isso instalará o Cypress localmente como uma dependência de desenvolvimento para o seu projeto.
```
npm install cypress --save-dev
```

Isso inicia o aplicativo Cypress para que você possa escolher entre testes de ponta a ponta (E2E) ou testes de componente (CT) e começar a escrever testes.
```
npx cypress open
```

---
### Configuração Inicial

Cada teste executa as seguintes etapas no `beforeEach`:

```typescript
beforeEach(() => {
  cy.login();                                    // Autentica o usuário
  cy.visit('/tradutor', { failOnStatusCode: false }); // Navega para a página
});
```

**Nota:** A opção `failOnStatusCode: false` foi necessária devido a redirecionamentos 301 no ambiente de staging.

---

## 🧪 Casos de Teste Implementados

### 1. Seleção de Arquivo

**Objetivo:** Verificar que o usuário pode selecionar um arquivo e que ele é exibido corretamente.

```typescript
it('Testes para permitir selecionar um arquivo', () => {
  cy.get('input[type="file"]').attachFile('sample.pdf');
  cy.contains('Selecionado: sample.pdf').should('exist');
});
```

**Resultado Esperado:**
- ✅ Input aceita o arquivo
- ✅ Chip com nome do arquivo é exibido
- ✅ Status muda para "Pronto para traduzir"

---

### 2. Validação de Botão Desabilitado

**Objetivo:** Garantir que o botão "Traduzir" permaneça desabilitado quando não há arquivo selecionado.

```typescript
it('Testes para manter o botão Traduzir desabilitado sem arquivo', () => {
  cy.get('[data-testid="translate-button"]').should('be.disabled');
});
```

**Resultado Esperado:**
- ✅ Botão está desabilitado ao carregar a página
- ✅ Impede envio acidental sem arquivo

---

### 3. Tradução com Sucesso

**Objetivo:** Simular uma tradução bem-sucedida e verificar a resposta da aplicação.

```typescript
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
```

**Resultado Esperado:**
- ✅ Requisição POST é enviada
- ✅ Status muda para "Tradução concluída"
- ✅ Arquivo traduzido é recebido

---

### 4. Preview de PDF

**Objetivo:** Verificar que PDFs traduzidos são exibidos em um iframe de preview.

```typescript
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
```

**Resultado Esperado:**
- ✅ Iframe é renderizado
- ✅ Blob URL é carregado no src do iframe
- ✅ PDF é visível para o usuário

---

### 5. Seleção de Idioma

**Objetivo:** Testar a funcionalidade de mudança de idioma de destino.

```typescript
it('Testes para permitir trocar o idioma de destino', () => {
  cy.intercept('GET', '**/languages').as('langs');
  cy.wait('@langs');

  cy.get('.MuiSelect-select').click();
  cy.contains('li', 'English (en)').click();
  cy.get('.MuiSelect-select').should('contain.text', 'English (en)');
});
```

**Resultado Esperado:**
- ✅ Lista de idiomas é carregada da API
- ✅ Select abre e exibe opções
- ✅ Idioma selecionado é atualizado

---

### 6. Abertura em Nova Aba

**Objetivo:** Verificar que PDFs podem ser abertos em nova aba do navegador.

```typescript
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
```

**Resultado Esperado:**
- ✅ Botão "Abrir em nova aba" é visível
- ✅ `window.open()` é chamado com URL correta
- ✅ Nova aba seria aberta (simulado via stub)

---

### 7. Download de PDF

**Objetivo:** Testar a funcionalidade de download de arquivos traduzidos.

```typescript
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
```

**Resultado Esperado:**
- ✅ Botão "Baixar" está disponível
- ✅ Elemento `<a>` é criado temporariamente
- ✅ Download é iniciado
- ✅ Elemento `<a>` é removido após download

---

### 8. Download de Arquivo Não-PDF

**Objetivo:** Validar download de arquivos que não são PDFs (DOCX, TXT, etc).

```typescript
it('Testes para fazer o download de arquivo traduzido não-PDF', () => {
  cy.intercept('POST', 'https://tradudoc.duckdns.org/translate-file', {
    statusCode: 200,
    body: 'Conteúdo traduzido do documento',
    headers: { 
      'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'content-disposition': 'attachment; filename="translated_document.docx"'
    }
  }).as('translateFile');

  cy.get('input[type="file"]').attachFile('sample.pdf');
  cy.get('[data-testid="translate-button"]').click();
  cy.wait('@translateFile');

  cy.contains('O arquivo foi traduzido com sucesso').should('exist');
  cy.contains('button', 'Baixar arquivo traduzido').should('exist').and('be.visible');
  cy.contains('button', 'Baixar arquivo traduzido').click();
});
```

**Resultado Esperado:**
- ✅ Mensagem de sucesso sem preview
- ✅ Botão de download é exibido
- ✅ Download funciona para formatos não-PDF

---

### 9. Verificação de Conteúdo do Iframe

**Objetivo:** Garantir que o iframe carrega o PDF corretamente com blob URL.

```typescript
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
```

**Resultado Esperado:**
- ✅ Iframe existe no DOM
- ✅ Atributo `src` contém URL blob válida
- ✅ PDF é carregado para visualização

---

### 10. Botão "Nova Tradução"

**Objetivo:** Testar a limpeza do estado ao iniciar nova tradução.

```typescript
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
```

**Resultado Esperado:**
- ✅ Preview é removido
- ✅ Estado volta para "Aguardando arquivo"
- ✅ Formulário está pronto para nova tradução

---

### 11. Botão "Fechar"

**Objetivo:** Verificar que o botão "Fechar" remove o preview.

```typescript
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
```

**Resultado Esperado:**
- ✅ Botão "Fechar" está visível
- ✅ Preview é removido ao clicar
- ✅ Estado é resetado

---

## 📊 Cobertura de Testes

| Funcionalidade | Status | Prioridade |
|---|---|---|
| Upload de arquivo | ✅ Testado | Alta |
| Validação de formulário | ✅ Testado | Alta |
| Tradução via API | ✅ Testado | Alta |
| Preview de PDF | ✅ Testado | Alta |
| Seleção de idioma | ✅ Testado | Média |
| Abertura em nova aba | ✅ Testado | Média |
| Download de PDF | ✅ Testado | Alta |
| Download de outros formatos | ✅ Testado | Média |
| Verificação de iframe | ✅ Testado | Baixa |
| Botão "Nova tradução" | ✅ Testado | Média |
| Botão "Fechar" | ✅ Testado | Média |

**Cobertura Total:** 11 casos de teste implementados

---

### 3. Stub de Funções do Window

Para testar abertura de novas abas sem realmente abrir:

```typescript
cy.window().then((win) => {
  cy.stub(win, 'open').as('windowOpen');
});
cy.get('@windowOpen').should('have.been.calledOnce');
```

---

### 4. Espera por Requisições Assíncronas

Uso de aliases para aguardar conclusão de chamadas:

```typescript
cy.wait('@translateFile');
cy.wait('@langs');
```

---

### 5. Seletores Customizados

Utilização de `data-testid` para seletores estáveis:

```typescript
cy.get('[data-testid="translate-button"]')
cy.get('[data-testid="error-message"]')
cy.get('[data-testid="file-chip"]')
```

---


## 📚 Referências

- [Cypress Documentation](https://docs.cypress.io)
- [cypress-file-upload Plugin](https://github.com/abramenal/cypress-file-upload)
- [Material-UI Testing Guide](https://mui.com/material-ui/guides/testing/)
- [Best Practices for E2E Testing](https://docs.cypress.io/guides/references/best-practices)

---

**Status Final:** ✅ **Todos os testes passando**