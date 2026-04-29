# syntax=docker/dockerfile:1

FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app/backend/src \
    FABLEMAP_OUTPUT_ROOT=/data \
    FABLEMAP_ENV=production

WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/src ./backend/src
COPY tests/fixtures ./tests/fixtures

RUN useradd --create-home --shell /usr/sbin/nologin fablemap \
    && mkdir -p /data \
    && chown -R fablemap:fablemap /app /data

USER fablemap

EXPOSE 8000
VOLUME ["/data"]

CMD ["uvicorn", "fablemap_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
