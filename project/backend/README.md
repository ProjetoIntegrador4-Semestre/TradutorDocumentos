## 📦 Dependências

Antes de rodar, você precisa ter instalado:

- [Python 3.11](https://www.python.org/)
- [Pip](https://pip.pypa.io/)
- [Virtualenv](https://virtualenv.pypa.io/) para ambientes isolados

---

### 🔧 Instalação das dependências
```
py -3.11 -m venv venv (Não funciona com versões mais atualizadas como 3.13)
```

```
venv\Scripts\activate
```

```
pip install -r requirements.txt
``` 

### 🚀 Execução da aplicação
```
uvicorn app.main:app --reload
```

alembic init migrations
alembic revision --autogenerate -m "create users table"
alembic upgrade head

Google Cloud Platoform --> APIs e Serviços --> Credenciais --> Criar Credenciais --> ID do Client OAuth