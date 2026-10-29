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

# Run as non-root for defence-in-depth. collectstatic runs at container start
# (in entrypoint.sh) so it has SECRET_KEY from the runtime env.
RUN addgroup --system django && \
    adduser --system --ingroup django --home /app django && \
    mkdir -p /app/db /app/media /app/staticfiles && \
    chown -R django:django /app
USER django
ENV HOME=/app

EXPOSE 8000

CMD ["./entrypoint.sh"]
