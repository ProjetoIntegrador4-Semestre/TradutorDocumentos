```mermaid
graph LR
  linkStyle default fill:#ffffff

  subgraph diagram ["Sistema de Tradução de Documentos - System Context"]
    style diagram fill:#ffffff,stroke:#ffffff

    1["<div style='font-weight: bold'>Usuário</div><div style='font-size: 70%; margin-top: 0px'>[Person]</div><div style='font-size: 80%; margin-top:10px'>Cliente final usando o app</div>"]
    style 1 fill:#08427b,stroke:#052e56,color:#ffffff
    2["<div style='font-weight: bold'>Google Translate API</div><div style='font-size: 70%; margin-top: 0px'>[Software System]</div>"]
    style 2 fill:#999999,stroke:#6b6b6b,color:#ffffff
    3["<div style='font-weight: bold'>AWS S3</div><div style='font-size: 70%; margin-top: 0px'>[Software System]</div>"]
    style 3 fill:#999999,stroke:#6b6b6b,color:#ffffff
    4["<div style='font-weight: bold'>Sistema de Tradução de Documentos</div><div style='font-size: 70%; margin-top: 0px'>[Software System]</div><div style='font-size: 80%; margin-top:10px'>Backend principal do projeto</div>"]
    style 4 fill:#999999,stroke:#6b6b6b,color:#ffffff

    1-. "<div>Usa</div><div style='font-size: 70%'></div>" .->4
    4-. "<div>Armazena/Recupera arquivos</div><div style='font-size: 70%'></div>" .->3
    4-. "<div>Solicita tradução</div><div style='font-size: 70%'></div>" .->2
  end