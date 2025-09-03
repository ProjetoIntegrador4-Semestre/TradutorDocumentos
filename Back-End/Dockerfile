# Dockerfile
FROM python:3.12-slim

WORKDIR /app

# 1) Pacotes do sistema (instala fonte com suporte a cirílico)
RUN apt-get update \
 && apt-get install -y --no-install-recommends fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*

# 2) Dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3) Código
COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8000","--reload"]
