FROM python:3.12.1

WORKDIR /app

RUN pip install poetry
RUN poetry config virtualenvs.create false

COPY poetry.lock pyproject.toml ./

RUN poetry install --no-interaction --no-ansi --no-root
RUN poetry run python -m playwright install chromium --with-deps

COPY ./app/ ./app

CMD ["python", "-u", "-m", "app.main"]