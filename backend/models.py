"""
SQLAlchemy ORM Models for Smart Parking Slot Allocation System.
Product 9: OS & CN Product-Based Lab.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from database import Base


class ParkingSlot(Base):
    __tablename__ = "parking_slots"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    slot_number = Column(String(10), unique=True, index=True, nullable=False)
    status = Column(String(20), default="AVAILABLE", nullable=False)  # AVAILABLE, OCCUPIED, MAINTENANCE
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    current_vehicle = relationship("Vehicle", back_populates="current_slot")
    sessions = relationship("ParkingSession", back_populates="slot")

    def to_dict(self):
        return {
            "id": self.id,
            "slot_number": self.slot_number,
            "status": self.status,
            "vehicle_id": self.vehicle_id,
            "current_vehicle": self.current_vehicle.to_dict() if self.current_vehicle else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    registration_number = Column(String(30), unique=True, index=True, nullable=False)
    owner_name = Column(String(100), nullable=False)
    vehicle_type = Column(String(50), nullable=False)  # Car, Bike, SUV, Electric Vehicle, Other
    mobile_number = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    current_slot = relationship("ParkingSlot", back_populates="current_vehicle", uselist=False)
    sessions = relationship("ParkingSession", back_populates="vehicle", cascade="all, delete-orphan")
    waiting_entries = relationship("WaitingQueue", back_populates="vehicle", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "registration_number": self.registration_number,
            "owner_name": self.owner_name,
            "vehicle_type": self.vehicle_type,
            "mobile_number": self.mobile_number,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ParkingSession(Base):
    __tablename__ = "parking_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    slot_id = Column(Integer, ForeignKey("parking_slots.id", ondelete="CASCADE"), nullable=False)
    entry_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    exit_time = Column(DateTime, nullable=True)
    duration = Column(Float, nullable=True)  # in seconds
    status = Column(String(20), default="ACTIVE", nullable=False)  # ACTIVE, COMPLETED

    # Relationships
    vehicle = relationship("Vehicle", back_populates="sessions")
    slot = relationship("ParkingSlot", back_populates="sessions")

    def to_dict(self):
        duration_fmt = None
        if self.duration is not None:
            mins, secs = divmod(int(self.duration), 60)
            hours, mins = divmod(mins, 60)
            if hours > 0:
                duration_fmt = f"{hours}h {mins}m {secs}s"
            elif mins > 0:
                duration_fmt = f"{mins}m {secs}s"
            else:
                duration_fmt = f"{secs}s"

        return {
            "id": self.id,
            "vehicle_id": self.vehicle_id,
            "slot_id": self.slot_id,
            "slot_number": self.slot.slot_number if self.slot else None,
            "registration_number": self.vehicle.registration_number if self.vehicle else None,
            "owner_name": self.vehicle.owner_name if self.vehicle else None,
            "vehicle_type": self.vehicle.vehicle_type if self.vehicle else None,
            "entry_time": self.entry_time.isoformat() if self.entry_time else None,
            "exit_time": self.exit_time.isoformat() if self.exit_time else None,
            "duration": self.duration,
            "duration_formatted": duration_fmt,
            "status": self.status,
        }


class WaitingQueue(Base):
    __tablename__ = "waiting_queue"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    arrival_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    queue_position = Column(Integer, nullable=False)
    status = Column(String(20), default="WAITING", nullable=False)  # WAITING, ALLOCATED, CANCELLED

    # Relationships
    vehicle = relationship("Vehicle", back_populates="waiting_entries")

    def to_dict(self):
        return {
            "id": self.id,
            "vehicle_id": self.vehicle_id,
            "registration_number": self.vehicle.registration_number if self.vehicle else None,
            "owner_name": self.vehicle.owner_name if self.vehicle else None,
            "vehicle_type": self.vehicle.vehicle_type if self.vehicle else None,
            "arrival_time": self.arrival_time.isoformat() if self.arrival_time else None,
            "queue_position": self.queue_position,
            "status": self.status,
        }


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    operation = Column(String(50), nullable=False)  # ENTRY, EXIT, QUEUE_JOIN, AUTO_ALLOCATE, etc.
    vehicle_number = Column(String(30), nullable=True)
    slot_number = Column(String(10), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    result = Column(String(50), nullable=False)  # SUCCESS, QUEUED, ERROR, CANCELLED
    details = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "operation": self.operation,
            "vehicle_number": self.vehicle_number,
            "slot_number": self.slot_number,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "result": self.result,
            "details": self.details,
        }
