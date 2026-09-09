FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-cache

# Copy application code
COPY . .

# Windows checkouts may use CRLF; the Linux shell requires LF.
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

# Run migrations, seed, and start the app
ENTRYPOINT ["./entrypoint.sh"]
