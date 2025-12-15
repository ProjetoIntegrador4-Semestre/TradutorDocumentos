### 5️⃣ Relatório Quinzenal – Sprint

#### 🎯 Objetivo da Sprint
Consolidar o desenvolvimento das principais partes do projeto (frontend web, mobile e backend Python já funcional), avançar na migração do backend para Java e preparar a integração entre os módulos, garantindo a base necessária para posterior implantação na nuvem.

---

#### ✅ Lista de Entregas Concluídas
- Frontend web com telas principais implementadas (Login, Registro, Tradutor e Histórico).
- Aplicativo mobile com fluxo de seleção e upload de documentos concluído.
- Backend em Python com endpoints de tradução e histórico funcionando.
- Configuração inicial de autenticação JWT no backend.
- Estrutura de repositório organizada com branches e commits padronizados.
- Documento de visão atualizado.
- Protótipo no Figma ajustado de acordo com feedback da equipe/professores.

---

#### 📊 Indicadores
- **Board (GitHub Project):**
  - Issues abertas: 23  
  - Issues fechadas: 14  
  - PRs mergeadas: 5  
- Velocidade da sprint: **~80% das entregas planejadas concluídas**.

---

#### 🚧 Dificuldades Encontradas (Impedimentos)
- Integração das partes (frontend, mobile e backend) ainda não concluída.
- Backend em Java em desenvolvimento → alguns endpoints ainda não migrados do Python.
- Parte de infraestrutura em nuvem (AWS/CloudFormation) ainda pendente, com dificuldades de configuração inicial.
- Ajustes de compatibilidade entre autenticação JWT e os dois backends (Python x Java).

---

#### 🔜 Próximos Passos (Próxima Sprint)
- Concluir a migração do backend de Python para Java.
- Integrar frontend e mobile com o backend Java.
- Configurar armazenamento de arquivos traduzidos no S3 (AWS).
- Implementar pipeline de CI/CD (Github Actions).
- Avançar na arquitetura em nuvem (CloudFormation/Terraform).
- Testes integrados entre todos os módulos.

---

#### 🔗 Resumo de Rastreabilidade → Issues x PRs x Entregas
- **Issues**: vinculadas às features concluídas (ex.: upload de arquivos, autenticação JWT).
- **PRs**: cada entrega associada a pelo menos um PR mergeado na branch `develop`.
- **Entregas**: ligadas às milestones definidas no board (ex.: “Frontend básico”, “Mobile upload”, “Backend Python funcional”).

---

#### 🤝 Reflexão da Equipe (Mini Retrospectiva)

- **O que funcionou bem:**
  - Boa divisão de tarefas entre frontend, mobile e backend.
  - Comunicação clara via board e commits.
  - Protótipo validado e aceito pelos stakeholders.

- **O que não funcionou:**
  - Atraso na parte de nuvem e integração dos módulos.
  - Backend em Java ainda sem paridade completa com o backend Python.

- **O que pode ser melhorado:**
  - Melhorar a sincronização entre os times de backend e frontend para alinhar contratos de API.
  - Dedicar tempo específico apenas para a configuração de infraestrutura (AWS/CI/CD).
  - Reuniões mais curtas, mas mais frequentes, para acompanhar bloqueios de integração.

---