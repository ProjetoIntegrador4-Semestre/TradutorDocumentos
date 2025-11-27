# 🧪 Relatório de Testes — TranslatorPage (Cypress)

Este documento descreve de forma simples os testes automatizados realizados na página TranslatorPage utilizando Cypress (E2E Testing).

## ✅ 1. Teste de Renderização do Título

Objetivo: Verificar se a página de tradução está sendo carregada corretamente após autenticação.

### Validação:

O teste faz login usando um comando customizado (cy.login()).

Acessa a rota /tradutor.

Verifica se o título principal está presente:

```
cy.get('h4').should('contain.text', 'Traduzir Documento');
```

## Resultado:
A página foi carregada e exibiu corretamente o título “Traduzir Documento”.

## ✅ 2. Teste de Seleção de Arquivo

Objetivo: Validar se o usuário consegue escolher um arquivo para tradução.

Ações do teste:

Faz upload de sample.pdf usando attachFile.

Aguarda processamento.

Verifica se o chip de arquivo selecionado aparece com o texto correto:

```
cy.get('input[type="file"]').attachFile('sample.pdf');
cy.contains('Selecionado: sample.pdf').should('exist');
```

## Resultado:
A UI reconheceu corretamente o arquivo enviado e exibiu o chip “Selecionado: sample.pdf”.

## ✅ 3. Teste: Botão “Traduzir” Desabilitado Sem Arquivo

Objetivo: Garantir que o sistema não permita iniciar tradução antes de selecionar um arquivo.

### Validação:

O botão é verificado pela propriedade disabled.

```
cy.get('[data-testid="translate-button"]').should('be.disabled');
```

## Resultado:
Sistema impede corretamente a tradução sem entrada válida.

## ✅ 4. Teste de Erro ao Tentar Traduzir Sem Arquivo

Objetivo: Verificar se a aplicação exibe mensagem de erro caso o usuário tente traduzir sem enviar arquivo.

Ações:

Clica no botão Traduzir (mesmo desabilitado, simulamos tentativa).

Valida a mensagem de erro:

```
cy.get('[data-testid="translate-button"]').click({ force: true });
cy.get('[data-testid="error-message"]').should('contain.text', 'Selecione um arquivo');
```

## Resultado:
A aplicação orienta o usuário com a mensagem correta.

## ✅ 5. Teste de Troca de Idioma

Objetivo: Confirmar que o Select de idiomas funciona e o usuário pode escolher outro idioma além do padrão.

Ações:

Aguarda o carregamento da API /languages.

Abre o menu de idiomas clicando no componente MUI.

Seleciona “English (en)”.

Verifica se o select foi atualizado:

```
cy.get('.MuiSelect-select').click();
cy.contains('li', 'English (en)').click();
cy.get('.MuiSelect-select').should('contain.text', 'English (en)');
```

## Resultado:
A troca de idioma funcionou perfeitamente.

# 📌 Conclusão

Os testes realizados confirmam que:

- A autenticação funciona e permite acessar /tradutor.
- A página exibe corretamente seus elementos principais.
- O processo de seleção de arquivo está funcionando.
- O botão Traduzir só é habilitado quando apropriado.
- Mensagens de erro são exibidas corretamente.
- O seletor de idiomas está operacional.
- A interface comporta-se conforme esperado e os fluxos principais de uso foram validados com sucesso.