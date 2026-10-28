FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install system deps for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn psycopg2-binary

COPY . .

RUN chmod +x entrypoint.sh
RUN python manage.py collectstatic --noinput 2>/dev/null || true

# Run as non-root for defence-in-depth.
RUN addgroup --system django && \
    adduser --system --ingroup django --no-create-home django && \
    mkdir -p /app/db /app/media && \
    chown -R django:django /app
USER django

EXPOSE 8000

CMD ["./entrypoint.sh"]
