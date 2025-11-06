from __future__ import annotations

import os
import re
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .db import get_session, init_db
from .models import Job, JobStatus, JobResult
from .pipeline import run_full_pipeline


def create_app() -> FastAPI:
    app = FastAPI(title="Aruigo Tender Optimizer API", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup() -> None:
        init_db()

    @app.post("/api/jobs")
    async def create_job(
        background_tasks: BackgroundTasks,
        file: UploadFile = File(...),
        quality_score: float = Form(...),
        min_bid: Optional[float] = Form(default=None),
        max_bid: Optional[float] = Form(default=None),
    ):
        if quality_score < 0 or quality_score > 1:
            raise HTTPException(status_code=400, detail="quality_score must be between 0 and 1")

        job_id = str(uuid.uuid4())
        uploads_dir = os.path.join("/tmp", "aruigo_jobs", job_id)
        os.makedirs(uploads_dir, exist_ok=True)
        file_path = os.path.join(uploads_dir, file.filename)
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        with get_session() as session:
            job = Job(
                id=job_id,
                filename=file.filename,
                file_path=file_path,
                quality_score=quality_score,
                min_bid=min_bid,
                max_bid=max_bid,
                status=JobStatus.queued,
                created_at=datetime.utcnow(),
            )
            session.add(job)
            session.commit()
            session.refresh(job)  # Ensure job is fully persisted
            print(f"[API] Created job {job_id}, filename: {file.filename}", flush=True)

        background_tasks.add_task(_run_job_bg, job_id)
        return {"job_id": job_id, "status": JobStatus.queued}

    @app.get("/api/jobs")
    def list_jobs():
        with get_session() as session:
            jobs = session.query(Job).order_by(Job.created_at.desc()).limit(50).all()
            print(f"[API] list_jobs: Found {len(jobs)} jobs", flush=True)
            result = []
            for j in jobs:
                try:
                    job_dict = j.to_dict(include_paths=False)
                    if j.result is not None:
                        job_dict["result"] = j.result.to_dict()
                    result.append(job_dict)
                except Exception as e:
                    print(f"[API] Error serializing job {j.id}: {e}", flush=True)
                    continue
            print(f"[API] Returning {len(result)} jobs", flush=True)
            return result

    @app.get("/api/jobs/{job_id}")
    def get_job(job_id: str):
        with get_session() as session:
            job = session.query(Job).get(job_id)
            if not job:
                raise HTTPException(status_code=404, detail="Job not found")
            data = job.to_dict(include_paths=False)
            if job.result is not None:
                data["result"] = job.result.to_dict()
            return data

    return app


def _run_job_bg(job_id: str) -> None:
    with get_session() as session:
        job = session.query(Job).get(job_id)
        if not job:
            return
        job.status = JobStatus.running
        job.started_at = datetime.utcnow()
        session.commit()

        try:
            import traceback
            pipeline_out = run_full_pipeline(
                pdf_path=job.file_path,
                quality_score=job.quality_score,
                min_bid=job.min_bid,
                max_bid=job.max_bid,
                work_dir=os.path.dirname(job.file_path),
            )

            result = JobResult(
                job_id=job.id,
                base_price=pipeline_out.get("base_price"),
                best_bid=pipeline_out.get("best_bid"),
                p_win=pipeline_out.get("p_win_at_best"),
                expected_profit=pipeline_out.get("expected_profit_at_best"),
                profit_if_won=pipeline_out.get("profit_if_won_at_best"),
                initial_bracket=pipeline_out.get("initial_bracket"),
                auto_expanded=pipeline_out.get("auto_expanded"),
                diagnostic_bids=pipeline_out.get("diagnostic_bids"),
                diagnostic_exp_profit=pipeline_out.get("diagnostic_exp_profit"),
                extracted_data=pipeline_out.get("extracted_data"),
            )
            session.add(result)
            job.status = JobStatus.succeeded
            job.completed_at = datetime.utcnow()
            session.commit()
            print(f"[Job {job_id}] SUCCESS", flush=True)
        except Exception as e:
            error_trace = traceback.format_exc()
            print(f"[Job {job_id}] FAILED: {e}\n{error_trace}", flush=True)
            job.status = JobStatus.failed
            job.error_message = f"{str(e)}\n\n{error_trace[:500]}"  # Limit error message length
            job.completed_at = datetime.utcnow()
            session.commit()


app = create_app()


