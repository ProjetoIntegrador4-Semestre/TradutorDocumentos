```mermaid
graph LR
  linkStyle default fill:#ffffff

  subgraph diagram ["Sistema de Tradução de Documentos - Containers"]
    style diagram fill:#ffffff,stroke:#ffffff

    1["<div style='font-weight: bold'>Usuário</div><div style='font-size: 70%; margin-top: 0px'>[Person]</div><div style='font-size: 80%; margin-top:10px'>Cliente final usando o app</div>"]
    style 1 fill:#08427b,stroke:#052e56,color:#ffffff
    2["<div style='font-weight: bold'>Google Translate API</div><div style='font-size: 70%; margin-top: 0px'>[Software System]</div>"]
    style 2 fill:#999999,stroke:#6b6b6b,color:#ffffff
    3["<div style='font-weight: bold'>AWS S3</div><div style='font-size: 70%; margin-top: 0px'>[Software System]</div>"]
    style 3 fill:#999999,stroke:#6b6b6b,color:#ffffff

    subgraph 4 ["Sistema de Tradução de Documentos"]
      style 4 fill:#ffffff,stroke:#6b6b6b,color:#6b6b6b

      14["<div style='font-weight: bold'>Banco de Dados (PostgreSQL/AWS RDS)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Guarda usuários e histórico</div>"]
      style 14 fill:#1168bd,stroke:#0b4884,color:#ffffff
      15["<div style='font-weight: bold'>Armazenamento de Arquivos (AWS S3)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Guarda arquivos enviados</div>"]
      style 15 fill:#1168bd,stroke:#0b4884,color:#ffffff
      16["<div style='font-weight: bold'>Serviço de Tradução (Google Translate API)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Tradução automática</div>"]
      style 16 fill:#1168bd,stroke:#0b4884,color:#ffffff
      17["<div style='font-weight: bold'>Sistema de Logs/Monitoramento (CloudWatch/Grafana)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Monitoramento e logs</div>"]
      style 17 fill:#1168bd,stroke:#0b4884,color:#ffffff
      5["<div style='font-weight: bold'>Mobile App (React Native/Expo)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Interface do usuário</div>"]
      style 5 fill:#1168bd,stroke:#0b4884,color:#ffffff
      6["<div style='font-weight: bold'>Web App (opcional)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Interface web</div>"]
      style 6 fill:#1168bd,stroke:#0b4884,color:#ffffff
      7["<div style='font-weight: bold'>Backend API (Python/FastAPI)</div><div style='font-size: 70%; margin-top: 0px'>[Container]</div><div style='font-size: 80%; margin-top:10px'>Orquestra requisições e<br />lógica de negócios</div>"]
      style 7 fill:#1168bd,stroke:#0b4884,color:#ffffff
    end

    1-. "<div>Usa</div><div style='font-size: 70%'></div>" .->5
    1-. "<div>Usa (opcional)</div><div style='font-size: 70%'></div>" .->6
    5-. "<div>Chama API</div><div style='font-size: 70%'></div>" .->7
    6-. "<div>Chama API (opcional)</div><div style='font-size: 70%'></div>" .->7
    7-. "<div>Armazena/Recupera arquivos</div><div style='font-size: 70%'></div>" .->3
    7-. "<div>Solicita tradução</div><div style='font-size: 70%'></div>" .->2
    7-. "<div>Lê/Escreve dados</div><div style='font-size: 70%'></div>" .->14
    7-. "<div>Upload/Download arquivos</div><div style='font-size: 70%'></div>" .->15
    7-. "<div>Solicita tradução</div><div style='font-size: 70%'></div>" .->16
    7-. "<div>Registra eventos</div><div style='font-size: 70%'></div>" .->17
  end