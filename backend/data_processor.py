import os
import pandas as pd
import numpy as np

DEFAULT_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "data.csv")

REQUIRED_COLUMNS = [
    "date", "day", "weather", "student_count",
    "prepared_quantity", "remaining_quantity", "sold_quantity",
    "sold_out", "snack_type"
]

VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
VALID_WEATHER = ["Sunny", "Cloudy", "Rainy", "Drizzle", "Humid", "Stormy"]

def load_data(csv_path=None):
    """
    Safely loads and validates the fieldwork dataset.
    Returns a clean pandas DataFrame or an empty DataFrame if file is empty/missing.
    """
    path = csv_path or DEFAULT_DATA_PATH
    if not os.path.exists(path):
        return pd.DataFrame(columns=REQUIRED_COLUMNS)
    
    try:
        df = pd.read_csv(path)
        if df.empty:
            return pd.DataFrame(columns=REQUIRED_COLUMNS)
        
        # Check required columns
        for col in REQUIRED_COLUMNS:
            if col not in df.columns:
                raise ValueError(f"Missing required column in dataset: {col}")
        
        # Type cleanup & normalization
        df["student_count"] = pd.to_numeric(df["student_count"], errors="coerce").fillna(0).astype(int)
        df["prepared_quantity"] = pd.to_numeric(df["prepared_quantity"], errors="coerce").fillna(0).astype(int)
        df["remaining_quantity"] = pd.to_numeric(df["remaining_quantity"], errors="coerce").fillna(0).astype(int)
        df["sold_quantity"] = pd.to_numeric(df["sold_quantity"], errors="coerce").fillna(0).astype(int)
        
        # Clean boolean sold_out
        df["sold_out"] = df["sold_out"].astype(str).str.strip().str.lower().isin(["true", "1", "yes", "t"])
        df["day"] = df["day"].astype(str).str.strip().str.capitalize()
        df["weather"] = df["weather"].astype(str).str.strip().str.capitalize()
        df["snack_type"] = df["snack_type"].astype(str).str.strip()
        
        return df
    except Exception as e:
        print(f"Error loading data from {path}: {e}")
        return pd.DataFrame(columns=REQUIRED_COLUMNS)

def get_summary_stats(df=None, csv_path=None):
    """
    Computes core operational statistics for the hostel mess cook dashboard.
    """
    if df is None:
        df = load_data(csv_path)
    
    if df.empty or len(df) == 0:
        return {
            "total_observations": 0,
            "avg_daily_consumption": 0,
            "avg_leftover_quantity": 0,
            "avg_prepared_quantity": 0,
            "avg_student_count": 0,
            "highest_demand_day": "N/A",
            "highest_demand_value": 0,
            "lowest_demand_day": "N/A",
            "lowest_demand_value": 0,
            "days_ran_out": 0,
            "days_excess": 0,
            "wastage_rate_percent": 0.0,
            "stockout_rate_percent": 0.0
        }
    
    total_obs = len(df)
    avg_sold = round(float(df["sold_quantity"].mean()), 1)
    avg_leftover = round(float(df["remaining_quantity"].mean()), 1)
    avg_prepared = round(float(df["prepared_quantity"].mean()), 1)
    avg_turnout = round(float(df["student_count"].mean()), 1)
    
    # Highest & Lowest demand records
    max_row = df.loc[df["sold_quantity"].idxmax()]
    min_row = df.loc[df["sold_quantity"].idxmin()]
    
    highest_day = f"{max_row['day']} ({max_row['sold_quantity']} portions - {max_row['snack_type']})"
    lowest_day = f"{min_row['day']} ({min_row['sold_quantity']} portions - {min_row['snack_type']})"
    
    # Days ran out vs excess
    days_ran_out = int((df["sold_out"] == True).sum())
    days_excess = int((df["remaining_quantity"] > 0).sum())
    
    total_prepared = int(df["prepared_quantity"].sum())
    total_remaining = int(df["remaining_quantity"].sum())
    wastage_rate = round((total_remaining / total_prepared * 100) if total_prepared > 0 else 0, 1)
    stockout_rate = round((days_ran_out / total_obs * 100) if total_obs > 0 else 0, 1)
    
    return {
        "total_observations": total_obs,
        "avg_daily_consumption": avg_sold,
        "avg_leftover_quantity": avg_leftover,
        "avg_prepared_quantity": avg_prepared,
        "avg_student_count": avg_turnout,
        "highest_demand_day": highest_day,
        "highest_demand_value": int(max_row["sold_quantity"]),
        "lowest_demand_day": lowest_day,
        "lowest_demand_value": int(min_row["sold_quantity"]),
        "days_ran_out": days_ran_out,
        "days_excess": days_excess,
        "wastage_rate_percent": wastage_rate,
        "stockout_rate_percent": stockout_rate
    }

def get_demand_analytics(df=None, csv_path=None):
    """
    Aggregates comparisons across weekdays, weather, turnout correlation, and prepared vs consumed.
    """
    if df is None:
        df = load_data(csv_path)
    
    if df.empty or len(df) == 0:
        return {
            "by_day": [],
            "by_weather": [],
            "turnout_vs_consumption": [],
            "prepared_vs_sold_timeline": [],
            "by_snack_type": []
        }
    
    # 1. Day of Week
    day_order = {day: i for i, day in enumerate(VALID_DAYS)}
    day_grp = df.groupby("day").agg(
        avg_student_count=("student_count", "mean"),
        avg_prepared=("prepared_quantity", "mean"),
        avg_sold=("sold_quantity", "mean"),
        avg_remaining=("remaining_quantity", "mean"),
        count=("sold_quantity", "count")
    ).reset_index()
    day_grp["order"] = day_grp["day"].map(day_order)
    day_grp = day_grp.sort_values("order").drop(columns=["order"])
    by_day = [
        {
            "day": row["day"],
            "avg_student_count": round(row["avg_student_count"], 1),
            "avg_prepared": round(row["avg_prepared"], 1),
            "avg_sold": round(row["avg_sold"], 1),
            "avg_remaining": round(row["avg_remaining"], 1),
            "sample_size": int(row["count"])
        }
        for _, row in day_grp.iterrows()
    ]
    
    # 2. By Weather
    weather_grp = df.groupby("weather").agg(
        avg_student_count=("student_count", "mean"),
        avg_sold=("sold_quantity", "mean"),
        avg_remaining=("remaining_quantity", "mean"),
        stockouts=("sold_out", "sum"),
        count=("sold_quantity", "count")
    ).reset_index()
    by_weather = [
        {
            "weather": row["weather"],
            "avg_student_count": round(row["avg_student_count"], 1),
            "avg_sold": round(row["avg_sold"], 1),
            "avg_remaining": round(row["avg_remaining"], 1),
            "stockouts": int(row["stockouts"]),
            "sample_size": int(row["count"])
        }
        for _, row in weather_grp.iterrows()
    ]
    
    # 3. Turnout vs Consumption Correlation points
    turnout_vs_consumption = [
        {
            "date": row["date"],
            "day": row["day"],
            "weather": row["weather"],
            "student_count": int(row["student_count"]),
            "sold_quantity": int(row["sold_quantity"]),
            "snack_type": row["snack_type"]
        }
        for _, row in df.iterrows()
    ]
    
    # 4. Prepared vs Sold Timeline
    timeline = [
        {
            "date": row["date"],
            "day": row["day"][:3],
            "prepared": int(row["prepared_quantity"]),
            "sold": int(row["sold_quantity"]),
            "remaining": int(row["remaining_quantity"]),
            "sold_out": bool(row["sold_out"]),
            "snack_type": row["snack_type"]
        }
        for _, row in df.sort_values("date").iterrows()
    ]
    
    # 5. By Snack Type
    snack_grp = df.groupby("snack_type").agg(
        avg_prepared=("prepared_quantity", "mean"),
        avg_sold=("sold_quantity", "mean"),
        avg_remaining=("remaining_quantity", "mean"),
        count=("sold_quantity", "count")
    ).reset_index()
    by_snack = [
        {
            "snack_type": row["snack_type"],
            "avg_prepared": round(row["avg_prepared"], 1),
            "avg_sold": round(row["avg_sold"], 1),
            "avg_remaining": round(row["avg_remaining"], 1),
            "sample_size": int(row["count"])
        }
        for _, row in snack_grp.iterrows()
    ]
    
    return {
        "by_day": by_day,
        "by_weather": by_weather,
        "turnout_vs_consumption": turnout_vs_consumption,
        "prepared_vs_sold_timeline": timeline,
        "by_snack_type": by_snack
    }

def add_observation(record, csv_path=None):
    """
    Validates and appends a newly recorded snack session.
    Protects original records and enforces sensible data integrity.
    """
    path = csv_path or DEFAULT_DATA_PATH
    
    # Validate fields
    date = str(record.get("date", "")).strip()
    day = str(record.get("day", "")).strip().capitalize()
    weather = str(record.get("weather", "")).strip().capitalize()
    snack_type = str(record.get("snack_type", "")).strip()
    
    if not date:
        return False, "Date is required (YYYY-MM-DD)."
    if day not in VALID_DAYS:
        return False, f"Invalid day '{day}'. Must be one of {VALID_DAYS}."
    if not weather:
        return False, "Weather is required."
    if not snack_type:
        return False, "Snack type is required."
    
    try:
        student_count = int(record.get("student_count", 0))
        prepared_quantity = int(record.get("prepared_quantity", 0))
        remaining_quantity = int(record.get("remaining_quantity", 0))
        sold_out = bool(record.get("sold_out", False))
    except (ValueError, TypeError):
        return False, "Counts and quantities must be valid integers."
    
    if student_count < 0 or prepared_quantity < 0 or remaining_quantity < 0:
        return False, "Quantities and student counts cannot be negative."
    
    if remaining_quantity > prepared_quantity:
        return False, "Remaining quantity cannot exceed prepared quantity."
    
    # Compute or verify sold quantity
    sold_quantity = record.get("sold_quantity")
    if sold_quantity is None or sold_quantity == "":
        sold_quantity = prepared_quantity - remaining_quantity
    else:
        try:
            sold_quantity = int(sold_quantity)
            if sold_quantity < 0:
                return False, "Sold quantity cannot be negative."
        except (ValueError, TypeError):
            sold_quantity = prepared_quantity - remaining_quantity
            
    if sold_quantity + remaining_quantity != prepared_quantity:
        # Auto-adjust remaining if sold was explicit or vice versa
        remaining_quantity = max(0, prepared_quantity - sold_quantity)
        
    if remaining_quantity == 0:
        sold_out = True
        
    new_row = pd.DataFrame([{
        "date": date,
        "day": day,
        "weather": weather,
        "student_count": student_count,
        "prepared_quantity": prepared_quantity,
        "remaining_quantity": remaining_quantity,
        "sold_quantity": sold_quantity,
        "sold_out": sold_out,
        "snack_type": snack_type
    }])
    
    if not os.path.exists(path):
        new_row.to_csv(path, index=False)
    else:
        new_row.to_csv(path, mode="a", header=False, index=False)
        
    return True, "Observation successfully added."
