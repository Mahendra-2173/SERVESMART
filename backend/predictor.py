import math
import pandas as pd
import numpy as np
from data_processor import load_data, VALID_DAYS, VALID_WEATHER

def predict_batch_quantity(day, weather, student_count, snack_type="Samosa", csv_path=None):
    """
    Explainable food demand prediction engine for hostel mess cooks.
    
    Steps:
    1. Filter historical records by day of week and weather condition.
    2. Assess similarity and data sufficiency.
    3. Calculate baseline demand and turnout-to-consumption ratio.
    4. Adjust demand based on early turnout (5:00 PM - 6:00 PM).
    5. Add sensible cook's buffer and round to sensible whole portions.
    6. Provide complete explainability breakdown and confidence score.
    """
    df = load_data(csv_path)
    
    # Clean inputs
    day = str(day).strip().capitalize()
    weather = str(weather).strip().capitalize()
    snack_type = str(snack_type).strip() if snack_type else "Samosa"
    try:
        student_count = max(0, int(student_count))
    except (ValueError, TypeError):
        student_count = 0

    # Fallback if dataset is completely empty
    if df.empty or len(df) == 0:
        base_rec = max(20, min(150, round(student_count * 1.05)))
        return {
            "recommended_quantity": base_rec,
            "estimated_demand_min": max(15, base_rec - 5),
            "estimated_demand_max": base_rec,
            "expected_leftover": 3,
            "historical_average": 0,
            "confidence": "Low (No Historical Data)",
            "confidence_level": "low",
            "sample_size": 0,
            "comparison_text": "No previous records found. Recommendation based on default 1:1 student-to-snack baseline.",
            "explanation_steps": [
                "No historical observations available in data.csv.",
                f"Using conservative fallback estimate based solely on 5-6 PM count ({student_count}).",
                f"Recommended batch: {base_rec} portions with caution."
            ]
        }

    # Step 1: Subsetting & Similarity Matching
    # Exact match: same day and same weather
    exact_match = df[(df["day"] == day) & (df["weather"] == weather)]
    # Day match: same day
    day_match = df[df["day"] == day]
    # Weather match: same weather
    weather_match = df[df["weather"] == weather]
    # Snack match
    snack_match = df[df["snack_type"].str.lower() == snack_type.lower()]

    overall_avg_turnout = float(df["student_count"].mean())
    overall_avg_sold = float(df["sold_quantity"].mean())
    overall_ratio = overall_avg_sold / overall_avg_turnout if overall_avg_turnout > 0 else 1.05

    explanation_steps = []
    
    # Determine reference cohort and confidence
    if len(exact_match) >= 2:
        confidence = "High"
        confidence_level = "high"
        cohort = exact_match
        cohort_desc = f"Identified {len(exact_match)} previous {weather} {day}s"
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
    else:
        confidence = "Low (Baseline Fallback)"
        confidence_level = "low"
        cohort = df
        cohort_desc = f"Insufficient specific records for {weather} {day}; using overall mess history ({len(df)} days)"

    cohort_avg_turnout = float(cohort["student_count"].mean())
    cohort_avg_sold = float(cohort["sold_quantity"].mean())
    cohort_ratio = cohort_avg_sold / cohort_avg_turnout if cohort_avg_turnout > 0 else overall_ratio

    explanation_steps.append(
        f"Step 1 - Historical Reference: {cohort_desc}. On these days, student 5-6 PM turnout averaged {round(cohort_avg_turnout, 1)} and snack consumption averaged {round(cohort_avg_sold, 1)} portions."
    )

    # Step 2: Compare Early Turnout
    turnout_diff = student_count - cohort_avg_turnout
    if abs(turnout_diff) <= 4:
        turnout_note = f"Today's early count ({student_count}) is on par with the usual average ({round(cohort_avg_turnout, 1)})."
    elif turnout_diff > 4:
        turnout_note = f"Today's early count ({student_count}) is ABOVE normal by {int(round(turnout_diff))} students (surge in footfall)."
    else:
        turnout_note = f"Today's early count ({student_count}) is BELOW normal by {int(round(abs(turnout_diff)))} students (slower turnout)."
    
    explanation_steps.append(f"Step 2 - Turnout Analysis: {turnout_note}")

    # Step 3: Turnout Momentum Adjustment
    # If turnout is higher/lower, snacks consumed scales with marginal arrival factor (~0.85 to 1.0)
    turnout_adjustment = turnout_diff * (0.85 * cohort_ratio)
    raw_demand = cohort_avg_sold + turnout_adjustment

    # Snack type preference modifier
    snack_mod = 0.0
    if not snack_match.empty and len(snack_match) >= 3:
        snack_avg_sold = float(snack_match["sold_quantity"].mean())
        snack_mod = (snack_avg_sold - overall_avg_sold) * 0.4
        if abs(snack_mod) >= 2:
            explanation_steps.append(
                f"Step 3 - Snack Preference: {snack_type} historically has {'higher' if snack_mod > 0 else 'lower'} demand than average ({round(snack_avg_sold, 1)} vs {round(overall_avg_sold, 1)}). Adjusted by {round(snack_mod, 1)} portions."
            )
    
    estimated_demand = raw_demand + snack_mod

    # Weather mood factor (Rain / Drizzle encourages hot snack cravings)
    weather_bump = 0.0
    if weather in ["Rainy", "Drizzle"] and "Rainy" not in cohort_desc and "Drizzle" not in cohort_desc:
        weather_bump = 5.0
        estimated_demand += weather_bump
        explanation_steps.append("Step 4 - Weather Mood: Rainy / Drizzle weather observed; added +5 portions for increased hot snack appetite.")

    # Step 4: Practical Kitchen Buffer & Batch Rounding
    # Cook needs a safety margin (+3 to +5 portions) to ensure food doesn't run out before 7 PM,
    # but not too much to prevent waste.
    buffer = 4
    if day in ["Friday", "Thursday"]:
        buffer = 5  # Higher stakes, avoid student disappointment before weekend
    elif day in ["Sunday", "Saturday"]:
        buffer = 3  # Lower traffic, reduce waste risk

    recommended_quantity = int(math.ceil((estimated_demand + buffer) / 5.0) * 5)
    
    # Sensible bounds check
    min_reasonable = max(15, int(student_count * 0.8))
    max_reasonable = max(min_reasonable + 10, min(160, int(student_count * 1.5) + 20))
    recommended_quantity = max(min_reasonable, min(max_reasonable, recommended_quantity))

    # Demand range
    demand_min = max(10, int(round(estimated_demand - 3)))
    demand_max = max(demand_min + 3, int(round(estimated_demand + 3)))
    
    expected_leftover = max(0, recommended_quantity - int(round(estimated_demand)))

    explanation_steps.append(
        f"Step 5 - Recommended Batch Calculation: Estimated demand is ~{int(round(estimated_demand))} portions ({demand_min}–{demand_max}). Added {buffer} portion safety margin and rounded to practical batch size: {recommended_quantity} portions."
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
        "comparison_text": comparison_text,
        "explanation_steps": explanation_steps,
        "cohort_desc": cohort_desc
    }
