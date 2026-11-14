import os
import re
from datetime import datetime
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
VALID_SNACKS = ["Samosa", "Bread Pakora", "Aloo Bonda", "Veg Cutlet", "Onion Pakora"]

def validate_csv_data(csv_path=None, df=None):
    """
    Performs comprehensive data integrity validation on the fieldwork CSV file.
    
    Checks:
    - File existence & non-emptiness
    - Required columns
    - Missing/null values
    - Negative quantities or student counts
    - Date format (YYYY-MM-DD)
    - Valid days of week & weather categories
    - Arithmetic relationship: prepared == sold + remaining
    - Remaining <= prepared
    - Duplicate date observations
    """
    path = csv_path or DEFAULT_DATA_PATH
    errors = []
    warnings = []

    if df is None:
        if not os.path.exists(path):
            return {
                "valid": False,
                "errors": [f"Data file does not exist at '{path}'."],
                "warnings": [],
                "row_count": 0,
                "columns_found": []
            }
        
        if os.path.exists(path) and os.path.getsize(path) == 0:
            return {
                "valid": False,
                "errors": ["Dataset file is empty (0 bytes). At least 20 observations required."],
                "warnings": [],
                "row_count": 0,
                "columns_found": []
            }

        try:
            df = pd.read_csv(path)
        except pd.errors.EmptyDataError:
            return {
                "valid": False,
                "errors": ["Dataset file is empty (no columns). At least 20 observations required."],
                "warnings": [],
                "row_count": 0,
                "columns_found": []
            }
        except Exception as e:
            return {
                "valid": False,
                "errors": [f"Malformed CSV file. Could not parse: {str(e)}"],
                "warnings": [],
                "row_count": 0,
                "columns_found": []
            }

    if df.empty:
        return {
            "valid": False,
            "errors": ["Dataset is empty (0 rows). At least 20 observations required."],
            "warnings": [],
            "row_count": 0,
            "columns_found": list(df.columns)
        }

    # 1. Required Columns Check
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns in dataset: {missing_cols}")
        return {
            "valid": False,
            "errors": errors,
            "warnings": warnings,
            "row_count": len(df),
            "columns_found": list(df.columns)
        }

    # 2. Row by row checks
    date_set = set()
    for idx, row in df.iterrows():
        row_num = idx + 2  # 1-indexed header + row
        
        # Date check
        d_val = str(row.get("date", "")).strip()
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", d_val):
            errors.append(f"Row {row_num}: Invalid date format '{d_val}'. Expected YYYY-MM-DD.")
        else:
            if d_val in date_set:
                warnings.append(f"Row {row_num}: Duplicate observation date '{d_val}'.")
            date_set.add(d_val)
            
            # Check calendar weekday consistency
            try:
                dt = datetime.strptime(d_val, "%Y-%m-%d")
                expected_day = dt.strftime("%A")
                actual_day = str(row.get("day", "")).strip().capitalize()
                if actual_day != expected_day:
                    warnings.append(
                        f"Row {row_num} ({d_val}): Calendar day is '{expected_day}', but recorded as '{actual_day}'."
                    )
            except ValueError:
                errors.append(f"Row {row_num}: Invalid calendar date '{d_val}'.")

        # Day check
        day_val = str(row.get("day", "")).strip().capitalize()
        if day_val not in VALID_DAYS:
            errors.append(f"Row {row_num}: Invalid day '{day_val}'. Must be one of {VALID_DAYS}.")

        # Weather check
        weather_val = str(row.get("weather", "")).strip().capitalize()
        if weather_val not in VALID_WEATHER:
            errors.append(f"Row {row_num}: Invalid weather '{weather_val}'. Must be one of {VALID_WEATHER}.")

        # Numeric checks
        for num_col in ["student_count", "prepared_quantity", "remaining_quantity", "sold_quantity"]:
            try:
                val = int(row[num_col])
                if val < 0:
                    errors.append(f"Row {row_num}: Column '{num_col}' has negative value ({val}).")
            except (ValueError, TypeError):
                errors.append(f"Row {row_num}: Column '{num_col}' must be a non-null integer.")

        # Arithmetic relationships
        try:
            prep = int(row["prepared_quantity"])
            rem = int(row["remaining_quantity"])
            sold = int(row["sold_quantity"])
            
            if rem > prep:
                errors.append(f"Row {row_num}: Remaining quantity ({rem}) exceeds prepared quantity ({prep}).")
            
            if prep != sold + rem:
                errors.append(
                    f"Row {row_num}: Arithmetic mismatch: prepared ({prep}) != sold ({sold}) + remaining ({rem})."
                )
        except (ValueError, TypeError):
            pass

    is_valid = len(errors) == 0
    return {
        "valid": is_valid,
        "errors": errors,
        "warnings": warnings,
        "row_count": len(df),
        "columns_found": list(df.columns)
    }

def load_data(csv_path=None):
    """
    Safely loads and parses the fieldwork dataset into a clean pandas DataFrame.
    """
    path = csv_path or DEFAULT_DATA_PATH
    if not os.path.exists(path):
        return pd.DataFrame(columns=REQUIRED_COLUMNS)
    
    try:
        df = pd.read_csv(path)
        if df.empty:
            return pd.DataFrame(columns=REQUIRED_COLUMNS)
        
        # Verify required columns
        for col in REQUIRED_COLUMNS:
            if col not in df.columns:
                raise ValueError(f"Missing required column in dataset: {col}")
        
        # Clean types
        df["student_count"] = pd.to_numeric(df["student_count"], errors="coerce").fillna(0).astype(int)
        df["prepared_quantity"] = pd.to_numeric(df["prepared_quantity"], errors="coerce").fillna(0).astype(int)
        df["remaining_quantity"] = pd.to_numeric(df["remaining_quantity"], errors="coerce").fillna(0).astype(int)
        df["sold_quantity"] = pd.to_numeric(df["sold_quantity"], errors="coerce").fillna(0).astype(int)
        
        df["sold_out"] = df["sold_out"].astype(str).str.strip().str.lower().isin(["true", "1", "yes", "t"])
        df["day"] = df["day"].astype(str).str.strip().str.capitalize()
        df["weather"] = df["weather"].astype(str).str.strip().str.capitalize()
        df["snack_type"] = df["snack_type"].astype(str).str.strip()
        
        return df
    except Exception as e:
        print(f"Error loading dataset from {path}: {e}")
        return pd.DataFrame(columns=REQUIRED_COLUMNS)

def get_summary_stats(df=None, csv_path=None):
    """
    Computes key operational dashboard metrics for SERVESMART.
    """
    if df is None:
        df = load_data(csv_path)
    
    if df.empty or len(df) == 0:
        return {
            "total_observations": 0,
            "avg_daily_consumption": 0.0,
            "avg_leftover_quantity": 0.0,
            "avg_prepared_quantity": 0.0,
            "avg_student_count": 0.0,
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
    
    max_row = df.loc[df["sold_quantity"].idxmax()]
    min_row = df.loc[df["sold_quantity"].idxmin()]
    
    highest_day = f"{max_row['day']} ({max_row['sold_quantity']} portions - {max_row['snack_type']})"
    lowest_day = f"{min_row['day']} ({min_row['sold_quantity']} portions - {min_row['snack_type']})"
    
    days_ran_out = int((df["sold_out"] == True).sum())
    days_excess = int((df["remaining_quantity"] > 0).sum())
    
    total_prep = int(df["prepared_quantity"].sum())
    total_rem = int(df["remaining_quantity"].sum())
    wastage_rate = round(float((total_rem / total_prep * 100)) if total_prep > 0 else 0.0, 1)
    stockout_rate = round(float((days_ran_out / total_obs * 100)) if total_obs > 0 else 0.0, 1)
    
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
    Computes aggregated analytics across weekdays, weather categories,
    turnout-to-consumption correlations, and 24-day operational timelines.
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
    
    # 1. By Day of Week
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
            "avg_student_count": round(float(row["avg_student_count"]), 1),
            "avg_prepared": round(float(row["avg_prepared"]), 1),
            "avg_sold": round(float(row["avg_sold"]), 1),
            "avg_remaining": round(float(row["avg_remaining"]), 1),
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
            "avg_student_count": round(float(row["avg_student_count"]), 1),
            "avg_sold": round(float(row["avg_sold"]), 1),
            "avg_remaining": round(float(row["avg_remaining"]), 1),
            "stockouts": int(row["stockouts"]),
            "sample_size": int(row["count"])
        }
        for _, row in weather_grp.iterrows()
    ]
    
    # 3. Turnout vs Consumption Correlation
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
            "avg_prepared": round(float(row["avg_prepared"]), 1),
            "avg_sold": round(float(row["avg_sold"]), 1),
            "avg_remaining": round(float(row["avg_remaining"]), 1),
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
    Validates and appends a new observation to data.csv with strict data integrity safeguards.
    """
    path = csv_path or DEFAULT_DATA_PATH
    
    date = str(record.get("date", "")).strip()
    day = str(record.get("day", "")).strip().capitalize()
    weather = str(record.get("weather", "")).strip().capitalize()
    snack_type = str(record.get("snack_type", "")).strip()
    
    if not date:
        return False, "Date is required (format: YYYY-MM-DD)."
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        return False, f"Invalid date format '{date}'. Expected YYYY-MM-DD."
    if day not in VALID_DAYS:
        return False, f"Invalid day '{day}'. Must be one of {VALID_DAYS}."
    if weather not in VALID_WEATHER:
        return False, f"Invalid weather '{weather}'. Must be one of {VALID_WEATHER}."
    if not snack_type:
        return False, "Snack type is required."
    
    try:
        student_count = int(record.get("student_count", 0))
        prepared_quantity = int(record.get("prepared_quantity", 0))
        remaining_quantity = int(record.get("remaining_quantity", 0))
        sold_out = bool(record.get("sold_out", False))
    except (ValueError, TypeError):
        return False, "Student count and quantities must be valid whole numbers."
    
    if student_count < 0 or prepared_quantity < 0 or remaining_quantity < 0:
        return False, "Quantities and student counts cannot be negative numbers."
    
    if remaining_quantity > prepared_quantity:
        return False, f"Remaining quantity ({remaining_quantity}) cannot exceed prepared quantity ({prepared_quantity})."
    
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
        return False, (
            f"Arithmetic inconsistency: prepared ({prepared_quantity}) != "
            f"sold ({sold_quantity}) + remaining ({remaining_quantity})."
        )
        
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
        
    return True, "Observation successfully verified and recorded."
