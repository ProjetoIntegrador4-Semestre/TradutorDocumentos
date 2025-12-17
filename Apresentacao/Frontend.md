# 📄 Doc Translator Web

Uma aplicação web moderna e completa para tradução de documentos, desenvolvida com React, TypeScript e Material-UI. O sistema oferece autenticação segura, gerenciamento de usuários, histórico de traduções e uma interface intuitiva com suporte a temas claro/escuro.

## 🎯 Sobre o Projeto

O **Doc Translator Web** é uma aplicação frontend que permite aos usuários fazer upload de documentos e traduzi-los para diferentes idiomas de forma rápida e eficiente. O sistema conta com autenticação completa (incluindo OAuth com Google), gerenciamento de usuários com diferentes níveis de permissão, e funcionalidades administrativas avançadas.

### ✨ Principais Funcionalidades

- 🔐 **Autenticação Completa**
  - Login/Cadastro tradicional com email e senha
  - Autenticação OAuth com Google
  - Recuperação de senha via email
  - Reset de senha seguro com tokens

- 📤 **Tradução de Documentos**
  - Upload de arquivos para tradução
  - Seleção de idioma de destino
  - Preview do documento traduzido
  - Download do arquivo traduzido

- 📋 **Histórico de Traduções**
  - Visualização de todas as traduções realizadas
  - Acesso rápido aos documentos traduzidos
  - Gerenciamento de arquivos anteriores

- 👥 **Painel Administrativo**
  - Listagem e busca de usuários
  - Gerenciamento de permissões (User/Admin)
  - Ativação/desativação de contas
  - Visualização de registros de tradução por usuário
  - Exclusão de usuários e registros

- 🎨 **Interface Moderna**
  - Design responsivo e intuitivo
  - Tema claro/escuro (Dark Mode)
  - Componentes neumórficos
  - Feedback visual em tempo real

- ⚙️ **Configurações Personalizadas**
  - Ajustes de preferências do usuário
  - Gerenciamento de perfil
  - Configurações de privacidade

## 🚀 Tecnologias Utilizadas

### Core
- **React 19.1.1** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.8.3** - Superset tipado do JavaScript
- **Vite 7.1.2** - Build tool e dev server ultrarrápido

### UI/UX
- **Material-UI (MUI) 7.3.5** - Framework de componentes React
  - `@mui/material` - Componentes principais
  - `@mui/icons-material` - Conjunto de ícones
  - `@emotion/react` & `@emotion/styled` - CSS-in-JS
- **React Icons 5.5.0** - Biblioteca de ícones

### Roteamento & Estado
- **React Router DOM 6.30.1** - Gerenciamento de rotas
- **React Context API** - Gerenciamento de estado global (autenticação, tema)

### HTTP & Arquivos
- **Axios 1.12.2** - Cliente HTTP para requisições à API
- **File-Saver 2.0.5** - Biblioteca para download de arquivos

### Testes
- **Cypress 15.7.1** - Testes E2E (end-to-end)
  - `cypress-file-upload` - Plugin para upload de arquivos nos testes

### Ambiente de Desenvolvimento
- **Vite Plugin React 5.0.0** - Plugin oficial do React para Vite

## 📁 Estrutura do Projeto

```
translator-web/
├── src/
│   ├── assets/              # Recursos estáticos (imagens, ícones)
│   ├── components/          # Componentes reutilizáveis
│   │   ├── common/          # Componentes comuns (ThemeSwitch)
│   │   ├── layout/          # Componentes de layout (AppShell, Sidebar, Topbar)
│   │   └── ProtectedRoute.tsx # HOC para rotas protegidas
│   ├── context/             # Contextos React
│   │   └── AuthContext.tsx  # Contexto de autenticação
│   ├── hooks/               # Custom Hooks
│   │   ├── useDownload.ts   # Hook para download de arquivos
│   │   └── useThemeMode.tsx # Hook para gerenciamento de tema
│   ├── pages/               # Páginas da aplicação
│   │   ├── admin/           # Páginas administrativas
│   │   │   └── AdminUsersPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── HistoryPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── OAuthCallback.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── TranslatorPage.tsx
│   ├── services/            # Serviços e APIs
│   │   ├── admin.ts         # Serviços administrativos
│   │   └── api.ts           # Cliente API e endpoints
│   ├── styles/              # Estilos globais
│   │   └── auth.css
│   ├── theme/               # Configuração de tema
│   │   └── theme.ts
│   ├── utils/               # Utilitários
│   │   └── role.ts          # Funções para gerenciamento de roles
│   ├── App.tsx              # Componente principal e rotas
│   ├── main.tsx             # Ponto de entrada da aplicação
│   ├── bootstrapOAuth.ts    # Inicialização OAuth
│   └── setupTests.ts        # Configuração de testes
├── cypress/                 # Testes E2E
│   ├── e2e/                 # Testes end-to-end
│   ├── fixtures/            # Dados de teste
│   └── support/             # Comandos e configurações Cypress
├── public/                  # Arquivos públicos estáticos
├── cypress.config.ts        # Configuração do Cypress
├── eslint.config.js         # Configuração do ESLint
├── tsconfig.json            # Configuração do TypeScript
├── vite.config.ts           # Configuração do Vite
├── vitest.config.ts         # Configuração do Vitest
└── package.json             # Dependências e scripts
```

## 🛠️ Arquitetura e Padrões

### Padrões Utilizados

- **Component-Based Architecture**: Componentes reutilizáveis e modulares
- **Context API Pattern**: Gerenciamento de estado global sem Redux
- **Custom Hooks**: Encapsulamento de lógica reutilizável
- **Protected Routes**: HOC para controle de acesso baseado em autenticação
- **Service Layer**: Separação da lógica de API em serviços dedicados
- **Proxy Pattern**: Vite proxy para desenvolvimento local

### Fluxo de Autenticação

1. **Login/Registro**: Credenciais enviadas para API
2. **Token JWT**: Armazenado no localStorage
3. **Interceptors**: Axios adiciona token em todas as requisições
4. **Context Provider**: Gerencia estado de autenticação globalmente
5. **Protected Routes**: Verifica autenticação e roles antes de renderizar

### Gerenciamento de Estado

- **AuthContext**: Estado de autenticação e usuário logado
- **ThemeModeProvider**: Tema (claro/escuro) persistido no localStorage
- **Local State**: useState/useReducer para estado de componentes

## 🔧 Configuração e Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Backend da API rodando (tradudoc.duckdns.org ou local)

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=https://tradudoc.duckdns.org
VITE_BOOT_TOKEN=seu_token_aqui
```

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre no diretório
cd translator-web

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (Vite)

# Build
npm run build        # Compila TypeScript e gera build de produção
npm run preview      # Preview do build de produção

# Testes
npm run test         # Executa testes unitários (Vitest)
npm run test:ui      # Abre interface gráfica de testes
npm run test:watch   # Modo watch para testes

# Qualidade de Código
npm run lint         # Executa ESLint para verificar código
```

## 🧪 Testes

### Testes E2E (Cypress)

```bash
# Abrir Cypress Test Runner
npx cypress open

# Executar testes em modo headless
npx cypress run
```

Os testes E2E cobrem:
- Fluxo de login
- Upload e tradução de documentos
- Navegação entre páginas
- Funcionalidades administrativas

## 🔐 Segurança

- **JWT Authentication**: Tokens seguros para autenticação
- **Protected Routes**: Controle de acesso baseado em roles
- **Password Reset**: Fluxo seguro com tokens temporários
- **HTTPS**: Comunicação criptografada com backend
- **Input Validation**: Validação de formulários no frontend
- **CORS**: Configuração adequada para requisições cross-origin

## 🎨 Componentes Principais

### AuthContext
Gerencia todo o ciclo de autenticação:
- Login/Logout
- Registro de usuários
- Refresh de dados do usuário
- OAuth com Google
- Recuperação e reset de senha

### AppShell
Layout principal da aplicação com:
- Sidebar responsiva
- Topbar com perfil do usuário
- Área de conteúdo principal

### TranslatorPage
Página principal de tradução:
- Upload de arquivos
- Seleção de idioma
- Preview de documentos
- Download de traduções

### AdminUsersPage
Painel administrativo completo:
- Tabela paginada de usuários
- Busca e filtros
- Edição de permissões
- Gerenciamento de registros

## 🌐 Integração com API

### Endpoints Principais

```typescript
// Autenticação
POST /api/auth/signin      // Login
POST /api/auth/signup      // Registro
POST /auth/password/forgot // Esqueci senha
POST /auth/password/reset  // Reset senha

// Tradução
POST /translate-file       // Traduzir documento
GET  /languages           // Listar idiomas
GET  /records             // Histórico de traduções
GET  /files/:id           // Download de arquivo

// Admin
GET  /admin/users         // Listar usuários
PUT  /admin/users/:id     // Atualizar usuário
DELETE /admin/users/:id   // Deletar usuário
```

### Interceptors

O cliente Axios está configurado com:
- **Request Interceptor**: Adiciona token JWT automaticamente
- **Response Interceptor**: Trata erros 401 (não autorizado)
- **Timeout**: 60 segundos para requisições longas

## 🚀 Deploy

### Build de Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`

### Deploy Recomendado

A aplicação pode ser hospedada em:
- **Vercel** (recomendado para projetos React)
- **Netlify**
- **AWS Amplify**
- **GitHub Pages**
- Qualquer servidor de arquivos estáticos

### Configuração de Proxy (Desenvolvimento)

O Vite está configurado para fazer proxy das requisições `/api`:

```typescript
proxy: {
  "/api": {
    target: "http://localhost:8000",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ""),
  },
}
```

## 📝 Boas Práticas Implementadas

- ✅ **TypeScript**: Tipagem forte em todo o código
- ✅ **Component Composition**: Componentes pequenos e reutilizáveis
- ✅ **Custom Hooks**: Lógica reutilizável encapsulada
- ✅ **Error Boundaries**: Tratamento de erros em componentes
- ✅ **Loading States**: Feedback visual durante operações assíncronas
- ✅ **Responsive Design**: Interface adaptável a diferentes telas
- ✅ **Accessibility**: Componentes acessíveis (Material-UI)
- ✅ **Code Splitting**: Carregamento otimizado com lazy loading
- ✅ **Environment Variables**: Configurações por ambiente
- ✅ **Linting**: Código consistente com ESLint

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Autores

Desenvolvido por Bruno Araújo Sakamoto

**Status do Projeto**: ✅ Em Produção

Para mais informações sobre o projeto, consulte o [Link do Repositório](https://github.com/ProjetoIntegrador4-Semestre/TradutorDocumentos) ou entre em contato com a equipe de desenvolvimento.
