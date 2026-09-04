import subprocess
from datetime import datetime
from typing import Optional


from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import Base, engine, get_db
from models import Job


app = FastAPI(
    title="Workload Automation API",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Create database tables
# ---------------------------------------------------------

Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------
# Request models
# ---------------------------------------------------------

class LoginRequest(BaseModel):
    username: str
    password: str


class JobCreate(BaseModel):
    name: str
    box_name: str
    server: str
    command: str = "echo hello"
    schedule: str = "Manual"
    priority: int = 5


# ---------------------------------------------------------
# Health
# ---------------------------------------------------------

@app.get("/api/health")
def health():
    return {
        "status": "UP",
        "service": "workload-automation-api"
    }


# ---------------------------------------------------------
# Login
# ---------------------------------------------------------

@app.post("/api/login")
def login(payload: LoginRequest):

    if (
        payload.username == "admin"
        and payload.password == "admin123"
    ):
        return {
            "authenticated": True,
            "username": payload.username,
            "role": "ADMIN"
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid username or password"
    )


# ---------------------------------------------------------
# List jobs
# ---------------------------------------------------------

@app.get("/api/jobs")
def list_jobs(
    server: Optional[str] = None,
    name: Optional[str] = None,
    db: Session = Depends(get_db)
):

    query = db.query(Job)

    if server:
        query = query.filter(Job.server.ilike(server))

    if name:
        query = query.filter(Job.name.ilike(f"%{name}%"))

    jobs = query.order_by(Job.id).all()

    return [
        {
            "id": job.id,
            "name": job.name,
            "box_name": job.box_name,
            "server": job.server,
            "status": job.status,
            "start_time": job.start_time,
            "end_time": job.end_time,
            "priority": job.priority,
            "exit_code": job.exit_code,
            "run": job.run
        }
        for job in jobs
    ]


# ---------------------------------------------------------
# Create job
# ---------------------------------------------------------

@app.post("/api/jobs")
def create_job(
    payload: JobCreate,
    db: Session = Depends(get_db)
):

    existing_job = (
        db.query(Job)
        .filter(Job.name == payload.name)
        .first()
    )

    if existing_job:
        raise HTTPException(
            status_code=409,
            detail="Job already exists"
        )

    job = Job(
        name=payload.name,
        box_name=payload.box_name,
        server=payload.server,
        command=payload.command,
        schedule=payload.schedule,
        status="INACTIVE",
        priority=payload.priority,
        exit_code=None,
        run=0,
        start_time=None,
        end_time=None
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "id": job.id,
        "name": job.name,
        "box_name": job.box_name,
        "server": job.server,
        "status": job.status,
        "priority": job.priority,
        "exit_code": job.exit_code,
        "run": job.run
    }
@app.post("/api/jobs/{job_id}/run")
def run_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    job.status = "RUNNING"
    job.run = (job.run or 0) + 1
    job.start_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    job.end_time = None
    job.exit_code = None

    db.commit()

    try:
        result = subprocess.run(
            job.command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=300
        )

        job.exit_code = result.returncode
        job.end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if result.returncode == 0:
            job.status = "SUCCESS"
        else:
            job.status = "FAILED"

        db.commit()
        db.refresh(job)

        return {
            "id": job.id,
            "name": job.name,
            "status": job.status,
            "run": job.run,
            "exit_code": job.exit_code,
            "start_time": job.start_time,
            "end_time": job.end_time,
            "output": result.stdout,
            "error": result.stderr
        }

    except subprocess.TimeoutExpired:
        job.status = "FAILED"
        job.exit_code = -1
        job.end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        db.commit()

        raise HTTPException(
            status_code=408,
            detail="Job execution timed out"
        )