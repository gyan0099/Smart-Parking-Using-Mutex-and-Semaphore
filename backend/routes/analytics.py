"""
Analytics & Historical Reporting Routes.
Product 9: Smart Parking Slot Allocation System
School of CS & AI, SR University.
"""

from datetime import datetime, timedelta
import io
import csv
from fastapi import APIRouter, Query, Response
from database import SessionLocal
from models import ParkingSession, Vehicle, ActivityLog, ParkingSlot

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Reports"])


@router.get("/dashboard")
def get_analytics(range_filter: str = Query("all", pattern="^(today|7days|30days|all)$")):
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        query = db.query(ParkingSession)

        if range_filter == "today":
            start_date = datetime(now.year, now.month, now.day)
            query = query.filter(ParkingSession.entry_time >= start_date)
        elif range_filter == "7days":
            start_date = now - timedelta(days=7)
            query = query.filter(ParkingSession.entry_time >= start_date)
        elif range_filter == "30days":
            start_date = now - timedelta(days=30)
            query = query.filter(ParkingSession.entry_time >= start_date)

        sessions = query.all()

        total_sessions = len(sessions)
        completed_sessions = [s for s in sessions if s.status == "COMPLETED"]
        total_completed = len(completed_sessions)

        # Average duration
        total_duration = sum(s.duration for s in completed_sessions if s.duration)
        avg_duration_mins = round((total_duration / total_completed) / 60, 1) if total_completed > 0 else 0.0

        # Vehicle Type Distribution
        type_counts = {}
        vehicles = db.query(Vehicle).all()
        for v in vehicles:
            type_counts[v.vehicle_type] = type_counts.get(v.vehicle_type, 0) + 1

        vtype_data = [{"name": k, "value": v} for k, v in type_counts.items()]
        if not vtype_data:
            vtype_data = [{"name": "Car", "value": 0}]

        # Peak hours analysis (00:00 to 23:00)
        hour_counts = {h: {"hour": f"{h:02d}:00", "entries": 0, "exits": 0} for h in range(24)}
        for s in sessions:
            if s.entry_time:
                hour_counts[s.entry_time.hour]["entries"] += 1
            if s.exit_time:
                hour_counts[s.exit_time.hour]["exits"] += 1

        hourly_activity = [hour_counts[h] for h in range(24)]

        # Slot Utilization
        slot_usage = {}
        for s in sessions:
            if s.slot:
                slot_code = s.slot.slot_number
                slot_usage[slot_code] = slot_usage.get(slot_code, 0) + 1

        all_slots = db.query(ParkingSlot).order_by(ParkingSlot.id.asc()).all()
        slot_utilization = [
            {"slot": s.slot_number, "uses": slot_usage.get(s.slot_number, 0)}
            for s in all_slots
        ]

        # Recent 7 days activity trend
        days_trend = []
        for i in range(6, -1, -1):
            day_target = now - timedelta(days=i)
            day_start = datetime(day_target.year, day_target.month, day_target.day)
            day_end = day_start + timedelta(days=1)
            entries_on_day = sum(1 for s in sessions if s.entry_time and day_start <= s.entry_time < day_end)
            exits_on_day = sum(1 for s in completed_sessions if s.exit_time and day_start <= s.exit_time < day_end)
            days_trend.append({
                "day": day_target.strftime("%a (%b %d)"),
                "entries": entries_on_day,
                "exits": exits_on_day,
            })

        return {
            "total_entries": total_sessions,
            "total_exits": total_completed,
            "avg_duration_minutes": avg_duration_mins,
            "vehicle_type_distribution": vtype_data,
            "hourly_activity": hourly_activity,
            "slot_utilization": slot_utilization,
            "days_trend": days_trend,
        }
    finally:
        db.close()


@router.get("/export/csv")
def export_parking_csv():
    """Generates and downloads a CSV of parking session history."""
    db = SessionLocal()
    try:
        sessions = db.query(ParkingSession).order_by(ParkingSession.entry_time.desc()).all()
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "Session ID",
            "Registration Number",
            "Owner Name",
            "Vehicle Type",
            "Slot Number",
            "Entry Time",
            "Exit Time",
            "Duration (seconds)",
            "Status"
        ])

        for s in sessions:
            writer.writerow([
                s.id,
                s.vehicle.registration_number if s.vehicle else "N/A",
                s.vehicle.owner_name if s.vehicle else "N/A",
                s.vehicle.vehicle_type if s.vehicle else "N/A",
                s.slot.slot_number if s.slot else "N/A",
                s.entry_time.isoformat() if s.entry_time else "",
                s.exit_time.isoformat() if s.exit_time else "",
                round(s.duration, 2) if s.duration else "",
                s.status,
            ])

        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=smart_parking_history.csv"}
        )
    finally:
        db.close()


@router.get("/history")
def get_parking_history():
    """Returns all parking sessions for the searchable history view."""
    db = SessionLocal()
    try:
        sessions = db.query(ParkingSession).order_by(ParkingSession.entry_time.desc()).limit(200).all()
        return [s.to_dict() for s in sessions]
    finally:
        db.close()
