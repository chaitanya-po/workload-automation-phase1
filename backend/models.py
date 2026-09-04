from sqlalchemy import Column, Integer, String

from db import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    box_name = Column(String(100), nullable=False)
    server = Column(String(100), nullable=False)
    command = Column(String(500), nullable=False)
    schedule = Column(String(100), default="Manual")
    status = Column(String(30), default="INACTIVE")
    priority = Column(Integer, default=5)
    exit_code = Column(Integer, nullable=True)
    run = Column(Integer, default=0)
    start_time = Column(String(30), nullable=True)
    end_time = Column(String(30), nullable=True)