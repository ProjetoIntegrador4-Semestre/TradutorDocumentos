# 🗓️ Relatório Quinzenal – Sprint 2

## 🎯 Objetivo da Sprint  
Finalizar a integração completa entre os módulos do sistema — backend, frontend web e aplicativo mobile — e consolidar a implantação dos serviços principais na nuvem, incluindo o banco de dados no BigQuery e o deploy do frontend.

---

## ✅ Lista de Entregas Concluídas  
- **Frontend Web** implantado na nuvem (AWS Amplify) e acessível publicamente.  
- **Banco de Dados (BigQuery)** configurado e operacional, com tabelas de histórico e usuários sincronizadas.  
- **Backend Java** parcialmente integrado com **frontend** e **aplicativo mobile**, garantindo o fluxo completo de autenticação e tradução de documentos.  
- Integração com **API externa de tradução** validada e funcional.  
- Testes de comunicação entre os módulos concluídos (requisições autenticadas e respostas validadas).  
- Ajustes finais de layout e responsividade no frontend.  

---

## 📊 Indicadores  
- **Board (GitHub Project):**  
  - Issues abertas: 6  
  - Issues fechadas: 19  
  - PRs mergeadas: 10  
- **Velocidade da sprint:** ~80% das entregas planejadas concluídas  
- **Status Geral:** Sistema funcional com módulos integrados e infraestrutura inicial consolidada  

---

## 🚧 Dificuldades Encontradas (Impedimentos)  
- Configuração do **CI/CD (GitHub Actions)** ainda em andamento.  
- Ajustes de performance no backend ao consumir dados do BigQuery.  
- Sincronização de logs e métricas entre backend e frontend ainda em otimização.  
- Falta de documentação detalhada de endpoints para o time mobile.  

---

## 🔜 Próximos Passos (Próxima Sprint)  
- Concluir **pipeline de CI/CD** para backend e frontend.  
- Automatizar **deploy contínuo** do backend na nuvem.  
- Implementar **armazenamento de arquivos** via AWS S3.  
- Finalizar o **Relatório de Segurança** e testes integrados.  
- Criar **dashboard administrativo** com dados do BigQuery.  
- Executar **testes de produção** e ajustes finais para apresentação.  

---

## 🔗 Rastreabilidade → Issues x PRs x Entregas  
- **Issues:** vinculadas às tasks de integração entre módulos e deploy na nuvem.  
- **PRs:** revisados e aprovados antes do merge em `develop` e `main`.  
- **Entregas:** associadas às milestones “Deploy Frontend”, “Integração Backend”, “Banco BigQuery Ativo”.  

---

## 🤝 Reflexão da Equipe (Mini Retrospectiva)  

### ✅ O que funcionou bem  
- Deploys do frontend e BigQuery bem-sucedidos.  
- Comunicação estável entre backend, web e mobile.  
- Boa organização e divisão de tarefas no board.  

### ⚠️ O que não funcionou  
- Pequenos atrasos na configuração do pipeline CI/CD.  
- Falta de padronização inicial nos logs do backend.  

### 🚀 O que pode ser melhorado  
- Centralizar documentação de APIs e endpoints.  
- Automatizar mais processos de build e deploy.  
- Priorizar otimizações e segurança para a entrega final.  

---

📅 **Data:** Outubro de 2025  
📍 **Projeto:** Tradução Automática de Documentos – SENAI-SP  