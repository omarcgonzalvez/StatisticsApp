FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copiar requerimientos e instalarlos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el proyecto
COPY . .

# Puerto estándar en la nube
ENV PORT=8080

# Arranca Gunicorn exponiendo la app Flask
CMD ["gunicorn", "-b", "0.0.0.0:8080", "wsgi:app"]
