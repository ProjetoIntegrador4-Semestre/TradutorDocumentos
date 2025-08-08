py -3.11 -m venv venv (Não funciona com versões mais atualizadas como 3.13)
venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload

alembic init migrations
alembic revision --autogenerate -m "create users table"
alembic upgrade head

Google Cloud Platoform --> APIs e Serviços --> Credenciais --> Criar Credenciais --> ID do Client OAuth