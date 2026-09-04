import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DB_PASSWORD = os.getenv("DATABASE_PASSWORD")

DB_HOST = os.getenv("DATABASE_HOST", "localhost")

if not DB_PASSWORD:
    raise RuntimeError("DATABASE_PASSWORD environment variable is not set")

DATABASE_URL = (
    f"postgresql+psycopg2://postgres:{DB_PASSWORD}"
    f"@{DB_HOST}:5432/workload_automation"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()