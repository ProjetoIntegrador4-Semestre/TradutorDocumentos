# 📱 Tradutor de Documentos - Aplicação Mobile

> Sistema completo de tradução de documentos com suporte a múltiplos formatos e idiomas, disponível para Web, Android e iOS.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API e Endpoints](#api-e-endpoints)
- [Testes](#testes)

## 📖 Sobre o Projeto

O **Tradutor de Documentos** é uma aplicação mobile multiplataforma desenvolvida como **Projeto Integrador do 4º Semestre** em parceria com a empresa **LabWare**, focado em tradução automatizada de documentos na área química.

A aplicação permite aos usuários traduzir documentos de diversos formatos (PDF, DOCX, PPTX, TXT) para diferentes idiomas de forma rápida e segura, oferecendo uma interface intuitiva, sistema de autenticação completo e histórico de traduções.

### 🎯 Objetivos

- Facilitar a tradução de documentos técnicos e profissionais
- Suportar múltiplos formatos de arquivo
- Oferecer uma experiência consistente em todas as plataformas (Web, iOS, Android)
- Manter histórico de traduções do usuário
- Garantir segurança através de autenticação JWT

### 🏫 Informações Acadêmicas

- **Instituição**: SENAI-SP – Escola SENAI de Informática
- **Empresa Parceira**: LabWare
- **Área de Atuação**: Química
- **Vigência**: 06/12/2024 a 06/12/2025

## ✨ Funcionalidades

### 🔐 Autenticação e Usuários

- **Login/Registro**: Sistema completo de autenticação com validação
- **Login Social**: Integração com Google OAuth 2.0
- **Recuperação de Senha**: Fluxo completo de reset de senha
- **Perfis de Usuário**: Suporte a usuários comuns e administradores
- **Mensagens de Erro Personalizadas**: Feedback claro para o usuário (ex: "E-mail ou senha incorretos")

### 📄 Tradução de Documentos

- **Múltiplos Formatos**: Suporte a PDF, DOCX, PPTX e TXT
- **Tradução em Lote**: Tradução de múltiplos arquivos simultaneamente
- **6 Idiomas Suportados**: Inglês, Português, Espanhol, Francês, Alemão e Italiano
- **Limite de Tamanho**: Arquivos de até 50MB por documento
- **Status em Tempo Real**: Acompanhamento do progresso da tradução
- **Download e Compartilhamento**: Baixe arquivos traduzidos e compartilhe com outros apps

### 📊 Histórico e Gestão

- **Histórico Completo**: Visualize todas as traduções realizadas
- **Filtros Avançados**: Filtre por nome, idioma, tipo de arquivo
- **Ordenação**: Ordene por data (mais recentes/antigos)
- **Exclusão de Registros**: Remova traduções antigas (somente admin)
- **Busca Inteligente**: Pesquisa em tempo real no histórico

### ⚙️ Configurações e Personalização

- **Temas**: Modo claro e escuro
- **Idiomas**: Interface em Português e Inglês
- **Internacionalização (i18n)**: Sistema completo de traduções
- **Configurações de Perfil**: Edição de dados do usuário

### 👨‍💼 Painel Administrativo

- **Gestão de Usuários**: Visualize e gerencie todos os usuários
- **Promoção de Usuários**: Transforme usuários em administradores
- **Exclusão de Usuários**: Remova usuários do sistema
- **Filtros de Usuários**: Filtre por role, status de ativação
- **Dashboard**: Estatísticas e métricas do sistema

## 🛠 Tecnologias Utilizadas

### Frontend Mobile

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **React Native** | 0.81.5 | Framework para desenvolvimento mobile |
| **Expo** | ~54.0.27 | Plataforma para aplicações React Native |
| **Expo Router** | ~6.0.17 | Sistema de roteamento baseado em arquivos |
| **TypeScript** | ~5.9.2 | Superset JavaScript com tipagem estática |
| **React** | 19.1.0 | Biblioteca para construção de interfaces |

### Bibliotecas e Ferramentas

#### 📱 Funcionalidades do Dispositivo
- **expo-document-picker** (^14.0.8): Seleção de documentos
- **expo-file-system** (^19.0.20): Gerenciamento de arquivos
- **expo-sharing** (^14.0.8): Compartilhamento de arquivos
- **expo-media-library** (~18.2.1): Acesso à galeria do dispositivo
- **expo-notifications** (~0.32.14): Sistema de notificações push

#### 🌐 Comunicação e APIs
- **axios** (^1.13.2): Cliente HTTP para requisições
- **expo-linking** (~8.0.10): Deep linking e navegação
- **expo-web-browser** (^15.0.10): Abertura de navegador in-app

#### 🎨 Interface e Experiência
- **@react-native-picker/picker** (^2.11.4): Seletor de opções
- **react-native-reanimated** (^4.2.0): Animações de alta performance
- **react-native-safe-area-context** (~5.6.0): Gerenciamento de áreas seguras

#### 🌍 Internacionalização
- **i18next** (^25.7.2): Framework de internacionalização
- **react-i18next** (^16.4.0): Integração i18next com React
- **expo-localization** (^17.0.8): Detecção de idioma do dispositivo

#### 💾 Armazenamento
- **@react-native-async-storage/async-storage** (^2.2.0): Armazenamento local persistente

#### 🧪 Testes
- **Jest** (^29.7.0): Framework de testes
- **@testing-library/react-native** (^12.8.1): Utilitários para testes de componentes
- **jest-expo** (~52.0.2): Preset Jest para Expo

### Backend

- **Spring Boot**: Framework Java para o backend
- **JWT (JSON Web Tokens)**: Autenticação e autorização
- **OAuth 2.0**: Integração com Google
- **RESTful API**: Comunicação entre frontend e backend
- **PostgreSQL**: Banco de dados relacional
- **Google Cloud Translation API**: Serviço de tradução

## 🏗 Arquitetura

### Estrutura de Pastas

```
tradutor-mobile/
├── app/                          # Rotas e telas (Expo Router)
│   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   ├── login.tsx             # Tela de login
│   │   ├── register.tsx          # Tela de registro
│   │   ├── forgot.tsx            # Recuperação de senha
│   │   └── oauth-google.tsx      # Callback OAuth Google
│   ├── (tabs)/                   # Grupo de rotas com tabs
│   │   ├── translator.tsx        # Tela principal de tradução
│   │   ├── history.tsx           # Histórico de traduções
│   │   ├── settings.tsx          # Configurações do usuário
│   │   └── admin.tsx             # Painel administrativo
│   ├── _layout.tsx               # Layout raiz
│   └── index.tsx                 # Tela inicial/splash
├── components/                   # Componentes reutilizáveis
│   ├── Input.tsx                 # Input customizado
│   ├── GoogleButton.tsx          # Botão de login com Google
│   ├── TopGreeting.tsx           # Saudação do usuário
│   └── ...
├── context/                      # Contextos React
│   ├── AuthContext.tsx           # Gerenciamento de autenticação
│   ├── ThemeContext.tsx          # Gerenciamento de temas
│   └── LangContext.tsx           # Gerenciamento de idioma
├── lib/                          # Utilitários e bibliotecas
│   ├── api.ts                    # Cliente API e configurações
│   ├── storage.ts                # Gerenciamento de armazenamento local
│   ├── translate.ts              # Funções de tradução
│   ├── records.ts                # Funções de histórico
│   └── events.ts                 # Sistema de eventos
├── i18n/                         # Internacionalização
│   └── index.tsx                 # Configuração i18n
├── constants/                    # Constantes da aplicação
│   ├── Colors.ts                 # Paleta de cores
│   ├── languages.ts              # Lista de idiomas
│   └── theme.ts                  # Configurações de tema
├── assets/                       # Recursos estáticos
│   ├── images/                   # Imagens e ícones
│   └── fonts/                    # Fontes customizadas
└── __tests__/                    # Testes automatizados
```

### Fluxo de Dados

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  React Native   │ ◄──► AsyncStorage (Dados Locais)
│   Components    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Context      │ (AuthContext, ThemeContext)
│   Providers     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    API Layer    │ (api.ts, translate.ts)
│   (Axios/Fetch) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend Java   │ ◄──► PostgreSQL
│  (Spring Boot)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Libretranslate  │
│                 │
└─────────────────┘
```

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Expo CLI** (instalado globalmente)
- **Git**
- **Android Studio** (para emulador Android) ou **Xcode** (para emulador iOS)
- **Expo Go** app instalado no celular (para testes em dispositivo físico)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/ProjetoIntegrador4-Semestre/TradutorDocumentos.git
cd IntegracaoMobileBack/tradutor-mobile
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

O backend está hospedado em:
```
BASE_URL=https://tradudoc.duckdns.org
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm start
# ou
expo start
```

### 5. Execute em diferentes plataformas

#### Web
```bash
npm run web
```

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

#### Dispositivo Físico (via Expo Go)
1. Abra o app **Expo Go** no seu dispositivo
2. Escaneie o QR Code mostrado no terminal
3. Aguarde o carregamento do app

## 💡 Como Usar

### 📱 Fluxo de Uso Básico

1. **Registro/Login**
   - Crie uma conta ou faça login com email/senha
   - Ou use "Entrar com Google" para login social

2. **Traduzir Documentos**
   - Na tela "Tradutor", clique em "Selecionar arquivo(s)"
   - Escolha um ou mais documentos (PDF, DOCX, PPTX, TXT)
   - Selecione o idioma de destino
   - Clique em "Enviar para tradução"
   - Aguarde o processamento
   - Clique em "Baixar e Compartilhar" para obter o arquivo traduzido

3. **Visualizar Histórico**
   - Acesse a aba "Histórico"
   - Use filtros para encontrar traduções específicas
   - Clique em "Abrir" para baixar novamente

4. **Configurações**
   - Acesse "Config." para alterar idioma e tema
   - Edite seu perfil
   - Faça logout quando necessário

5. **Administração** (somente admins)
   - Acesse "Admin" para gerenciar usuários
   - Promova usuários a administradores
   - Visualize estatísticas do sistema

## 🔌 API e Endpoints

### Base URL
```
https://tradudoc.duckdns.org
```

### Endpoints Principais

#### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/signin` | Login de usuário |
| POST | `/api/auth/signup` | Registro de novo usuário |
| GET | `/oauth2/authorization/google` | Inicia fluxo OAuth Google |

#### Tradução

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/translate-file` | Traduz um arquivo |
| GET | `/files/{filename}` | Baixa arquivo traduzido |

#### Histórico

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/records` | Lista histórico de traduções |
| DELETE | `/records/{id}` | Exclui registro (admin) |

#### Administração

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/users` | Lista todos os usuários |
| PATCH | `/api/admin/users/{id}` | Atualiza usuário |
| DELETE | `/api/admin/users/{id}` | Exclui usuário |

### Autenticação JWT

Todas as requisições autenticadas devem incluir o header:

```
Authorization: Bearer {token}
```

## 🧪 Testes

### Executar todos os testes

```bash
npm test
```

### Executar testes em modo watch

```bash
npm run test:watch
```

### Cobertura de testes

```bash
npm test -- --coverage
```

## 🎨 Temas e Personalização

### Temas Disponíveis

#### Tema Claro
```javascript
{
  bg: '#f2f2f2',
  surface: '#ffffff',
  text: '#1a1a1a',
  muted: '#666666',
  border: '#e0e0e0',
  primary: '#2b64ff'
}
```

#### Tema Escuro
```javascript
{
  bg: '#1a1a1a',
  surface: '#2c2c2c',
  text: '#ffffff',
  muted: '#999999',
  border: '#444444',
  primary: '#4a90ff'
}
```

## 🌍 Internacionalização

### Idiomas Suportados

- **Português (pt)**: Idioma padrão
- **Inglês (en)**: Idioma alternativo

### Adicionar Novo Idioma

Edite `i18n/index.tsx` e adicione o objeto de tradução no resources.

## 🔒 Segurança

### Medidas Implementadas

- ✅ **Autenticação JWT**: Tokens seguros com expiração
- ✅ **Validação de Entrada**: Sanitização de dados do usuário
- ✅ **HTTPS**: Comunicação criptografada
- ✅ **Armazenamento Seguro**: AsyncStorage para dados sensíveis
- ✅ **Tratamento de Erros**: Mensagens de erro sem expor informações sensíveis
- ✅ **Autorização por Roles**: Admin vs Usuário comum

## 📱 Compatibilidade

| Plataforma | Versão Mínima | Status |
|------------|---------------|--------|
| **Android** | Android 8.0 (API 26) | ✅ Suportado |
| **iOS** | iOS 13.4 | ✅ Suportado |
| **Web** | Navegadores modernos | ✅ Suportado |

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: Nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Padrões de Código

- Use **TypeScript** para tipagem estática
- Siga o **ESLint** configurado no projeto
- Escreva **testes** para novas funcionalidades
- Documente funções complexas com **JSDoc**
- Use **mensagens de commit semânticas**

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Equipe

Projeto desenvolvido como parte do **Projeto Integrador do 4º Semestre** em parceria com **LabWare**.

- **Organização**: ProjetoIntegrador4-Semestre
- **Repositório**: [TradutorDocumentos](https://github.com/ProjetoIntegrador4-Semestre/TradutorDocumentos)

## 📞 Suporte

Para suporte ou dúvidas:

- 🐛 Issues: [GitHub Issues](https://github.com/ProjetoIntegrador4-Semestre/TradutorDocumentos/issues)

## 🎓 Agradecimentos

- **LabWare** - Pela parceria e apoio ao projeto
- **SENAI-SP** - Pela estrutura e orientação
- **Expo Team** - Pela excelente plataforma de desenvolvimento
- **React Native Community** - Pelas bibliotecas e suporte
- **Google Cloud** - Pelos serviços de tradução
- **Professores e Orientadores** - Pelo apoio durante o desenvolvimento

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!**

Desenvolvido com ❤️ pela equipe do Projeto Integrador 4º Semestre - SENAI-SP
