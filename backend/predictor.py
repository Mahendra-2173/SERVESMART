import math
import pandas as pd
import numpy as np
from data_processor import load_data, VALID_DAYS, VALID_WEATHER

# Kitchen equipment constraints at Block 3 Kaveri Mess
MAX_KITCHEN_CAPACITY = 160   # Maximum single-shift gas fryer capacity (3 batches of 50-55)
MIN_VIABLE_BATCH = 15        # Minimum viable dough rolling batch for opening counter
DEFAULT_BATCH_SIZE = 5       # Standard display tray portion grouping
DEFAULT_SAFETY_BUFFER = 4    # Default safety margin to prevent 6:30 PM stockouts

def predict_batch_quantity(
    day, 
    weather, 
    student_count, 
    snack_type="Samosa", 
    safety_buffer=None,
    batch_size=None,
    csv_path=None
):
    """
    SERVESMART Explainable Food Demand Prediction Engine.
    
    Predicts evening snack batch size using a transparent statistical approach:
    1. Historical Cohort Matching (Day of week & Weather).
    2. Baseline demand and footfall-to-consumption velocity ratio.
    3. Proportional adjustment for early 5:00 PM - 6:00 PM student turnout.
    4. Empirical weather effect adjustment (only when not already in cohort).
    5. Configurable safety buffer and whole-portion batch rounding.
    6. Complete explainability breakdown and data confidence level.
    """
    df = load_data(csv_path)
    
    # Input normalization
    day = str(day).strip().capitalize() if day else ""
    weather = str(weather).strip().capitalize() if weather else ""
    snack_type = str(snack_type).strip() if snack_type else "Samosa"
    
    try:
        student_count = int(student_count)
    except (ValueError, TypeError):
        raise ValueError("Student count must be a valid integer.")
        
    if student_count < 0:
        raise ValueError("Student count cannot be negative.")
        
    if day not in VALID_DAYS:
        raise ValueError(f"Invalid day '{day}'. Must be one of {VALID_DAYS}.")
        
    if weather not in VALID_WEATHER:
        raise ValueError(f"Invalid weather '{weather}'. Must be one of {VALID_WEATHER}.")

    # Parameter resolution
    batch_size = int(batch_size) if batch_size and int(batch_size) > 0 else DEFAULT_BATCH_SIZE
    if safety_buffer is None:
        # Default dynamic buffer based on day-of-week risk
        if day in ["Friday", "Thursday"]:
            resolved_buffer = 5  # Higher penalty for stockout before weekend
        elif day in ["Saturday", "Sunday"]:
            resolved_buffer = 3  # Lower penalty, minimize waste on quiet days
        else:
            resolved_buffer = DEFAULT_SAFETY_BUFFER
    else:
        resolved_buffer = max(0, int(safety_buffer))

    # Fallback if dataset is completely empty
    if df.empty or len(df) == 0:
        base_demand = max(MIN_VIABLE_BATCH, int(round(student_count * 1.03)))
        rec = int(math.ceil((base_demand + resolved_buffer) / batch_size) * batch_size)
        rec = max(MIN_VIABLE_BATCH, min(MAX_KITCHEN_CAPACITY, rec))
        return {
            "recommended_quantity": rec,
            "estimated_demand_min": max(10, base_demand - 4),
            "estimated_demand_max": base_demand + 4,
            "expected_leftover": max(0, rec - base_demand),
            "historical_average": 0,
            "confidence": "Low (No Historical Data)",
            "confidence_level": "low",
            "sample_size": 0,
            "safety_buffer_applied": resolved_buffer,
            "batch_size_applied": batch_size,
            "comparison_text": "No previous records found. Recommendation based on default 1:1 student-to-snack baseline.",
            "explanation_steps": [
                "No historical observations available in data.csv.",
                f"Using conservative fallback estimate based solely on 5-6 PM count ({student_count}).",
                f"Applied {resolved_buffer} portion safety buffer and rounded to batch size of {batch_size}.",
                f"Recommended batch: {rec} portions (proceed with caution)."
            ]
        }

    # Step 1: Subsetting & Similarity Matching
    exact_match = df[(df["day"] == day) & (df["weather"] == weather)]
    day_match = df[df["day"] == day]
    weather_match = df[df["weather"] == weather]
    snack_match = df[df["snack_type"].str.lower() == snack_type.lower()]

    overall_avg_turnout = float(df["student_count"].mean())
    overall_avg_sold = float(df["sold_quantity"].mean())
    overall_ratio = overall_avg_sold / overall_avg_turnout if overall_avg_turnout > 0 else 1.03

    explanation_steps = []
    weather_already_in_cohort = False

    # Determine reference cohort and confidence
    if len(exact_match) >= 2:
        confidence = "High"
        confidence_level = "high"
        cohort = exact_match
        cohort_desc = f"Identified {len(exact_match)} previous {weather} {day}s"
        weather_already_in_cohort = True
    elif len(day_match) >= 2:
        confidence = "Moderate"
        confidence_level = "moderate"
        cohort = day_match
        cohort_desc = f"Identified {len(day_match)} previous {day}s (mixed weather)"
    elif len(weather_match) >= 2:
        confidence = "Moderate"
        confidence_level = "moderate"
        cohort = weather_match
        cohort_desc = f"Identified {len(weather_match)} previous {weather} days"
        weather_already_in_cohort = True
    else:
        confidence = "Low (Baseline Fallback)"
        confidence_level = "low"
        cohort = df
        cohort_desc = f"Insufficient specific records for {weather} {day}; using overall mess history ({len(df)} days)"

    cohort_avg_turnout = float(cohort["student_count"].mean())
    cohort_avg_sold = float(cohort["sold_quantity"].mean())
    cohort_ratio = cohort_avg_sold / cohort_avg_turnout if cohort_avg_turnout > 0 else overall_ratio

    explanation_steps.append(
        f"Step 1 - Historical Reference: {cohort_desc}. "
        f"On these days, 5-6 PM turnout averaged {round(cohort_avg_turnout, 1)} students "
        f"and final consumption averaged {round(cohort_avg_sold, 1)} portions."
    )

    # Step 2: Compare Early Turnout
    turnout_diff = student_count - cohort_avg_turnout
    if abs(turnout_diff) <= 3:
        turnout_note = f"Today's early count ({student_count}) is on par with usual average ({round(cohort_avg_turnout, 1)})."
    elif turnout_diff > 3:
        turnout_note = f"Today's early count ({student_count}) is ABOVE normal by {int(round(turnout_diff))} students (higher footfall momentum)."
    else:
        turnout_note = f"Today's early count ({student_count}) is BELOW normal by {int(round(abs(turnout_diff)))} students (slower turnout)."
    
    explanation_steps.append(f"Step 2 - Early Turnout Analysis: {turnout_note}")

    # Step 3: Turnout Momentum Adjustment
    # Every additional student arriving between 5-6 PM corresponds to ~1.03 portions
    turnout_adjustment = turnout_diff * cohort_ratio
    raw_demand = cohort_avg_sold + turnout_adjustment
    explanation_steps.append(
        f"Step 3 - Turnout Momentum Adjustment: Scaled baseline demand by {round(turnout_adjustment, 1):+g} portions "
        f"based on cohort arrival ratio ({round(cohort_ratio, 2)} portions/student)."
    )

    # Step 4: Weather Effect Adjustment (Data-Derived, Avoiding Double-Counting)
    weather_adjustment = 0.0
    if weather_already_in_cohort:
        explanation_steps.append(
            f"Step 4 - Weather Factor: Weather ({weather}) is already captured in the historical cohort baseline; "
            f"no redundant adjustment applied."
        )
    else:
        # Calculate empirical difference between this weather's historical average and overall average
        weather_subset = df[df["weather"] == weather]
        if not weather_subset.empty and len(weather_subset) >= 2:
            weather_avg_sold = float(weather_subset["sold_quantity"].mean())
            weather_adjustment = (weather_avg_sold - overall_avg_sold) * 0.5  # Smoothed empirical impact
            explanation_steps.append(
                f"Step 4 - Weather Factor: Historical {weather} sessions averaged {round(weather_avg_sold, 1)} portions "
                f"(overall mess average is {round(overall_avg_sold, 1)}). "
                f"Applied empirical adjustment of {round(weather_adjustment, 1):+g} portions."
            )
        else:
            explanation_steps.append(
                f"Step 4 - Weather Factor: Insufficient historical data for {weather} conditions; "
                f"neutral weather adjustment applied."
            )

    # Step 5: Snack Preference Modifier
    snack_mod = 0.0
    if not snack_match.empty and len(snack_match) >= 3:
        snack_avg_sold = float(snack_match["sold_quantity"].mean())
        snack_mod = (snack_avg_sold - overall_avg_sold) * 0.35
        if abs(snack_mod) >= 1.5:
            explanation_steps.append(
                f"Step 5 - Snack Preference: {snack_type} historically averages {round(snack_avg_sold, 1)} portions "
                f"vs mess average {round(overall_avg_sold, 1)}. Adjusted by {round(snack_mod, 1):+g} portions."
            )

    estimated_demand = raw_demand + weather_adjustment + snack_mod

    # Step 6: Configurable Kitchen Safety Buffer & Whole Portion Batch Rounding
    target_prep = estimated_demand + resolved_buffer
    recommended_quantity = int(math.ceil(target_prep / float(batch_size)) * batch_size)

    # Realistic Kitchen Bounds Clamping
    # Ensure minimum viable batch if students are present, clamp to max equipment capacity
    min_reasonable = MIN_VIABLE_BATCH if student_count > 0 else 0
    max_reasonable = MAX_KITCHEN_CAPACITY
    
    clamped_note = ""
    if recommended_quantity > max_reasonable:
        recommended_quantity = max_reasonable
        clamped_note = f" (Clamped to maximum fryer capacity of {MAX_KITCHEN_CAPACITY} portions)."
    elif recommended_quantity < min_reasonable and student_count > 0:
        recommended_quantity = min_reasonable
        clamped_note = f" (Raised to minimum viable preparation batch of {MIN_VIABLE_BATCH} portions)."

    demand_min = max(0, int(round(estimated_demand - 3)))
    demand_max = max(demand_min + 3, int(round(estimated_demand + 3)))
    expected_leftover = max(0, recommended_quantity - int(round(estimated_demand)))

    explanation_steps.append(
        f"Step 6 - Batch Sizing: Estimated student demand is ~{int(round(estimated_demand))} portions ({demand_min}–{demand_max}). "
        f"Added +{resolved_buffer} portion safety buffer to protect against 6:30 PM runouts. "
        f"Rounded to whole batch size ({batch_size}): {recommended_quantity} portions{clamped_note}."
    )

    comparison_text = f"Similar {day}s: Avg {round(cohort_avg_sold, 1)} portions consumed"

    return {
        "recommended_quantity": recommended_quantity,
        "estimated_demand_min": demand_min,
        "estimated_demand_max": demand_max,
        "expected_leftover": expected_leftover,
        "historical_average": round(cohort_avg_sold, 1),
        "confidence": confidence,
        "confidence_level": confidence_level,
        "sample_size": len(cohort),
        "safety_buffer_applied": resolved_buffer,
        "batch_size_applied": batch_size,
        "comparison_text": comparison_text,
        "explanation_steps": explanation_steps,
        "cohort_desc": cohort_desc
    }

def evaluate_model(csv_path=None):
    """
    Performs Leave-One-Out Cross-Validation (LOOCV) across all historical observations.
    
    A historical observation is NEVER used to predict itself.
    Compares the SERVESMART algorithm against a simple weekday-average baseline.
    """
    df = load_data(csv_path)
    n = len(df)
    
    if n < 5:
        return {
            "sufficient_data": False,
            "message": f"Insufficient observations ({n}) for reliable cross-validation. At least 5 observations required.",
            "sample_size": n
        }

    errors_model = []
    errors_baseline = []
    overpred_list = []
    underpred_list = []
    stockout_count = 0
    leftover_list = []

    for i in range(n):
        test_row = df.iloc[i]
        train_df = df.drop(df.index[i])
        actual_sold = int(test_row["sold_quantity"])
        
        # 1. Weekday-Average Baseline
        weekday_match = train_df[train_df["day"] == test_row["day"]]
        if not weekday_match.empty:
            baseline_pred = float(weekday_match["sold_quantity"].mean())
        else:
            baseline_pred = float(train_df["sold_quantity"].mean())
        errors_baseline.append(baseline_pred - actual_sold)

        # 2. SERVESMART Model Evaluation on train_df
        # Cohort selection on train_df
        exact = train_df[(train_df["day"] == test_row["day"]) & (train_df["weather"] == test_row["weather"])]
        day_m = train_df[train_df["day"] == test_row["day"]]
        weather_m = train_df[train_df["weather"] == test_row["weather"]]
        
        if len(exact) >= 2:
            cohort = exact
            weather_in_cohort = True
        elif len(day_m) >= 2:
            cohort = day_m
            weather_in_cohort = False
        elif len(weather_m) >= 2:
            cohort = weather_m
            weather_in_cohort = True
        else:
            cohort = train_df
            weather_in_cohort = False

        c_turnout = float(cohort["student_count"].mean())
        c_sold = float(cohort["sold_quantity"].mean())
        ratio = c_sold / c_turnout if c_turnout > 0 else 1.03
        
        delta_t = int(test_row["student_count"]) - c_turnout
        est_demand = c_sold + (delta_t * ratio)
        
        if not weather_in_cohort:
            w_subset = train_df[train_df["weather"] == test_row["weather"]]
            if not w_subset.empty and len(w_subset) >= 2:
                w_sold = float(w_subset["sold_quantity"].mean())
                overall_sold = float(train_df["sold_quantity"].mean())
                est_demand += (w_sold - overall_sold) * 0.5

        # Error on estimated demand
        err = est_demand - actual_sold
        errors_model.append(err)
        
        if err > 0:
            overpred_list.append(err)
        elif err < 0:
            underpred_list.append(abs(err))

        # Recommended batch with buffer (+4) and batch rounding (5)
        rec_batch = int(math.ceil((est_demand + 4) / 5.0) * 5)
        leftover = max(0, rec_batch - actual_sold)
        leftover_list.append(leftover)
        if rec_batch < actual_sold:
            stockout_count += 1

    mae_model = float(np.mean(np.abs(errors_model)))
    rmse_model = float(np.sqrt(np.mean(np.square(errors_model))))
    
    mae_base = float(np.mean(np.abs(errors_baseline)))
    rmse_base = float(np.sqrt(np.mean(np.square(errors_baseline))))
    
    improvement_pct = round(((mae_base - mae_model) / mae_base * 100), 1) if mae_base > 0 else 0.0

    return {
        "sufficient_data": True,
        "sample_size": n,
        "validation_method": "Leave-One-Out Cross-Validation (LOOCV)",
        "model_mae": round(mae_model, 2),
        "model_rmse": round(rmse_model, 2),
        "baseline_mae": round(mae_base, 2),
        "baseline_rmse": round(rmse_base, 2),
        "improvement_over_baseline_percent": improvement_pct,
        "avg_overprediction": round(float(np.mean(overpred_list)), 2) if overpred_list else 0.0,
        "avg_underprediction": round(float(np.mean(underpred_list)), 2) if underpred_list else 0.0,
        "simulated_stockout_count": stockout_count,
        "simulated_stockout_rate_percent": round((stockout_count / n * 100), 1),
        "simulated_avg_leftover": round(float(np.mean(leftover_list)), 2),
        "historical_actual_stockouts": int((df["sold_out"] == True).sum()),
        "historical_actual_stockout_rate_percent": round(float(((df["sold_out"] == True).sum() / n * 100)), 1),
        "historical_actual_avg_leftover": round(float(df["remaining_quantity"].mean()), 2)
    }
