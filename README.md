# Projeto Integrador IV - Tradução Automática de Documentos

Este repositório é destinado ao desenvolvimento colaborativo do projeto integrador do 4º semestre, com base no desafio proposto pela empresa **LabWare**, focado em **tradução automatizada de documentos**.

# Documento de Visão  
**Projeto:** Tradução Automática e Integrada de Documentos  
**Empresa Parceira:** LabWare  
**Área:** Química  
**Escola:** SENAI-SP – Escola SENAI de Informática  
**Vigência:** 06/12/2024 a 06/12/2025  

---

## 1. Introdução

### 1.1 Objetivo do Documento
Este documento tem como objetivo apresentar a visão geral do sistema de tradução automática de documentos, incluindo escopo, funcionalidades, stakeholders e requisitos de alto nível. Ele servirá como guia de referência para as fases seguintes do desenvolvimento.

### 1.2 Escopo do Produto
O sistema permitirá que usuários façam upload de arquivos (PDF, DOCX, PPT) e obtenham versões traduzidas automaticamente, com foco em agilidade, consistência e usabilidade.

### 1.3 Definições, Acrônimos e Abreviações
- **OCR**: Reconhecimento Óptico de Caracteres  
- **PDF**: Portable Document Format  
- **DOCX**: Documento do Microsoft Word  
- **PPT**: Apresentação do Microsoft PowerPoint  
- **API**: Interface de Programação de Aplicações  

### 1.4 Referências
- Desafio SENAI: [https://gpinovacao.senai.br](https://gpinovacao.senai.br)  
- Template de Documento: Notion – Modelo Documento de Visão  

### 1.5 Visão Geral do Documento
O documento cobre desde o contexto do problema até os requisitos e riscos do projeto, conforme estrutura padrão de Documento de Visão.

---

## 2. Posicionamento

### 2.1 Oportunidade de Negócio
Empresas e instituições lidam diariamente com documentos em diversos idiomas. Traduzir manualmente esses documentos é custoso e demorado.

### 2.2 Problema a Ser Resolvido
Falta de soluções acessíveis e integradas para tradução automática de arquivos com formatação preservada e pronta usabilidade.

### 2.3 Descrição do Produto
O sistema oferece uma interface simples onde o usuário faz o upload de documentos e recebe versões traduzidas automaticamente. O sistema manterá o layout do original sempre que possível.

### 2.4 Declaração de Posição do Produto
Para empresas e instituições que trabalham com documentos multilíngues, que necessitam traduzir rapidamente conteúdos técnicos ou administrativos, o **TraduDoc** é um serviço web de tradução automática de arquivos que agiliza o processo mantendo qualidade, padronização e produtividade.

---

## 3. Stakeholders e Usuários

### 3.1 Identificação dos Stakeholders
- **LabWare** – Empresa parceira  
- **Professores orientadores**  
- **Usuários Finais** (corporativos, acadêmicos)  
- **Equipe de desenvolvimento** (alunos)  

### 3.2 Perfis dos Usuários
- Tradutores técnicos  
- Pesquisadores  
- Profissionais de RH, jurídico e administração  
- Estudantes e docentes  

### 3.3 Necessidades dos Usuários e Stakeholders
- Upload rápido de documentos  
- Tradução fiel com preservação do layout  
- Suporte a múltiplos idiomas  
- Histórico de documentos processados  
- Interface simples e responsiva  

### 3.4 Ambiente Operacional
- Navegador Web (Chrome, Firefox)  
- Backend e banco de dados  
- Mobile App

---

## 4. Descrição do Produto

### 4.1 Perspectiva do Produto
O sistema será desenvolvido do zero, com backend, frontend web e aplicação mobile integrada, implantado em ambiente de nuvem.

### 4.2 Principais Funcionalidades
- Upload de arquivos (PDF, DOCX, PPT)  
- Seleção de idioma de origem e destino  
- Tradução automática com serviços de IA  
- Visualização e download da versão traduzida  
- Histórico de traduções por usuário  
- Login e autenticação JWT  
- Painel administrativo  

### 4.3 Suposições e Dependências
- A API de tradução (Google, DeepL, AWS, Gemini) estará disponível  
- O sistema terá acesso estável à internet  
- Os documentos enviados seguirão padrões básicos de formatação  

### 4.4 Limitações
- Traduções iniciais podem não ser 100% precisas  
- Documentos com imagens embutidas ou formatação complexa podem sofrer alterações  
- Traduções limitadas a idiomas suportados pela API  

---

## 5. Requisitos de Alto Nível

### Requisitos Funcionais
- **RF01**: O sistema deve permitir upload de arquivos em PDF, DOCX e PPT  
- **RF02**: O sistema deve integrar-se a uma API de tradução  
- **RF03**: O sistema deve exibir o resultado e permitir download  
- **RF04**: O sistema deve autenticar usuários com JWT  

### Requisitos Não Funcionais
- **RNF01**: O sistema deve responder às requisições em até 5 segundos  
- **RNF02**: Deve ser compatível com dispositivos móveis  
- **RNF03**: Deve operar com 99% de disponibilidade  

---

## 6. Características de Qualidade do Produto
- **Usabilidade**: Interface clara, simples e acessível  
- **Confiabilidade**: Monitoramento de erros e fallback de tradução  
- **Desempenho**: Tempo de resposta inferior a 5 segundos  
- **Segurança**: Autenticação JWT, HTTPS, controle de acesso  
- **Portabilidade**: Web responsivo e aplicativo mobile  

---

## 7. Restrições
- Uso de serviços gratuitos ou de baixo custo para tradução  
- Hospedagem em nuvem com orçamento educacional limitado  

---

## 8. Riscos
- API de tradução externa pode ter instabilidade  
- Dificuldades na manutenção de layout de documentos  

---

## 9. Possivel diagrama de serviços da nuvem


<img width="942" height="488" alt="image" src="https://github.com/user-attachments/assets/50008fcf-0112-4c0d-9edd-8fef14fd3966" />


## 10. Cronograma de Marcos

| Entrega | Descrição                            | Data     | Peso |
|---------|--------------------------------------|----------|------|
| 1       | Documento de Visão                   | 11/08    | 10%  |
| 2       | Figma + Planejamento                 | 22/08    | 20%  |
| 3       | Funcionalidades principais           | 03/10    | 30%  |
| 4       | Apresentação Final + Produto         | 12/12    | 40%  |

---

## 11. Apêndices
- Link do Desafio SENAI - [LabWare](https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/11121)
- Link do Figma - [Figma](https://www.figma.com/design/Yomqxzx9faQlRf6rXEid1H/Projeto---4%C2%B0-Semestre?node-id=0-1&p=f&t=dwrobzGKlHl0qMhz-0)
- Link do Modelo de Negócio - [Modelo de Negócio](docs/BusinessModel.png)
- Link do Sprints.md - [Sprints](docs/Sprints.md)

---

Integrantes do Grupo
- Bruno Sakamoto 
- Júlio Figueiredo 
- Luiz Medeiros
- Rafael Sinkevicius
- Samuel Silva

---
