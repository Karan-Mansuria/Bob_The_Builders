from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import Column, String, Float, DateTime, Enum, Text, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.types import JSON


Base = declarative_base()


class JobStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    succeeded = "succeeded"
    failed = "failed"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    file_path = Column(Text, nullable=False)
    quality_score = Column(Float, nullable=False)
    min_bid = Column(Float, nullable=True)
    max_bid = Column(Float, nullable=True)
    status = Column(Enum(JobStatus), default=JobStatus.queued, nullable=False)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    result = relationship("JobResult", back_populates="job", uselist=False, cascade="all, delete-orphan")

    def to_dict(self, include_paths: bool = False) -> Dict[str, Any]:
        return {
            "id": self.id,
            "filename": self.filename,
            "file_path": self.file_path if include_paths else None,
            "quality_score": self.quality_score,
            "min_bid": self.min_bid,
            "max_bid": self.max_bid,
            "status": self.status.value if isinstance(self.status, JobStatus) else self.status,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


class JobResult(Base):
    __tablename__ = "job_results"

    job_id = Column(String, ForeignKey("jobs.id"), primary_key=True)
    base_price = Column(Float, nullable=True)
    best_bid = Column(Float, nullable=True)
    p_win = Column(Float, nullable=True)
    expected_profit = Column(Float, nullable=True)
    profit_if_won = Column(Float, nullable=True)
    initial_bracket = Column(JSON, nullable=True)
    auto_expanded = Column(Boolean, nullable=True)
    diagnostic_bids = Column(JSON, nullable=True)
    diagnostic_exp_profit = Column(JSON, nullable=True)
    extracted_data = Column(JSON, nullable=True)  # All extracted tender parameters

    job = relationship("Job", back_populates="result")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "base_price": self.base_price,
            "best_bid": self.best_bid,
            "p_win_at_best": self.p_win,
            "expected_profit_at_best": self.expected_profit,
            "profit_if_won_at_best": self.profit_if_won,
            "initial_bracket": self.initial_bracket,
            "auto_expanded": self.auto_expanded,
            "diagnostic_bids": self.diagnostic_bids,
            "diagnostic_exp_profit": self.diagnostic_exp_profit,
            "extracted_data": self.extracted_data,
        }


