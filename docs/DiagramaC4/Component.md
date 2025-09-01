```mermaid
graph LR
  linkStyle default fill:#ffffff

  subgraph diagram ["Sistema de Tradução de Documentos - Backend API (Python/FastAPI) - Components"]
    style diagram fill:#ffffff,stroke:#ffffff

    14["<div style='font-weight: bold'>Banco de Dados (PostgreSQL/AWS RDS)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Guarda usuários e histórico</div>"]
    style 14 fill:#1168bd,stroke:#0b4884,color:#ffffff
    15["<div style='font-weight: bold'>Armazenamento de Arquivos (AWS S3)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Guarda arquivos enviados</div>"]
    style 15 fill:#1168bd,stroke:#0b4884,color:#ffffff
    16["<div style='font-weight: bold'>Serviço de Tradução (Google Translate API)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Tradução automática</div>"]
    style 16 fill:#1168bd,stroke:#0b4884,color:#ffffff
    17["<div style='font-weight: bold'>Sistema de Logs/Monitoramento (CloudWatch/Grafana)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Monitoramento e logs</div>"]
    style 17 fill:#1168bd,stroke:#0b4884,color:#ffffff

    subgraph 7 ["Backend API (Python/FastAPI)"]
      style 7 fill:#ffffff,stroke:#0b4884,color:#0b4884

      10["<div style='font-weight: bold'>Translation Controller</div><div style='font-size: 70%; margin-top: 0px'>[Component]</div><div style='font-size: 80%; margin-top:10px'>Chama Google Translate e<br />retorna resultado</div>"]
      style 10 fill:#438dd5,stroke:#2e6295,color:#ffffff
      11["<div style='font-weight: bold'>History Controller</div><div style='font-size: 70%; margin-top: 0px'>[Component]</div><div style='font-size: 80%; margin-top:10px'>Consulta e salva histórico</div>"]
      style 11 fill:#438dd5,stroke:#2e6295,color:#ffffff
      12["<div style='font-weight: bold'>Security Middleware</div><div style='font-size: 70%; margin-top: 0px'>[Component]</div><div style='font-size: 80%; margin-top:10px'>Autorização e validação</div>"]
      style 12 fill:#438dd5,stroke:#2e6295,color:#ffffff
      13["<div style='font-weight: bold'>Event Logger</div><div style='font-size: 70%; margin-top: 0px'>[Component]</div><div style='font-size: 80%; margin-top:10px'>Salva logs no sistema de<br />monitoramento</div>"]
      style 13 fill:#438dd5,stroke:#2e6295,color:#ffffff
      8["<div style='font-weight: bold'>Auth Controller</div><div style='font-size: 70%; margin-top: 0px'>[Component]</div><div style='font-size: 80%; margin-top:10px'>Login, cadastro, JWT</div>"]
      style 8 fill:#438dd5,stroke:#2e6295,color:#ffffff
      9["<div style='font-weight: bold'>File Controller</div><div style='font-size: 70%; margin-top: 0px'>[Component]</div><div style='font-size: 80%; margin-top:10px'>Upload/Download para S3</div>"]
      style 9 fill:#438dd5,stroke:#2e6295,color:#ffffff
    end

    8-. "<div>Valida usuário</div><div style='font-size: 70%'></div>" .->14
    9-. "<div>Upload/Download arquivos</div><div style='font-size: 70%'></div>" .->15
    10-. "<div>Chama API de tradução</div><div style='font-size: 70%'></div>" .->16
    11-. "<div>Consulta/Salva histórico</div><div style='font-size: 70%'></div>" .->14
    12-. "<div>Valida JWT</div><div style='font-size: 70%'></div>" .->8
    13-. "<div>Salva logs</div><div style='font-size: 70%'></div>" .->17
  end