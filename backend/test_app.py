import os
import json
import tempfile
import pandas as pd
from app import app
from predictor import predict_batch_quantity, evaluate_model, MAX_KITCHEN_CAPACITY, MIN_VIABLE_BATCH
from data_processor import (
    load_data, 
    get_summary_stats, 
    get_demand_analytics, 
    add_observation, 
    validate_csv_data,
    REQUIRED_COLUMNS
)

def run_all_tests():
    print("=" * 60)
    print("SERVESMART BACKEND COMPREHENSIVE TEST SUITE (22 TESTS)")
    print("=" * 60)
    client = app.test_client()

    # ---------------------------------------------------------
    # TEST 1: Normal Weekday Prediction
    # ---------------------------------------------------------
    print("\n[TEST 1] Normal Weekday Prediction (Wednesday Sunny, 85 students)...")
    res1 = predict_batch_quantity("Wednesday", "Sunny", 85, "Samosa")
    assert res1["recommended_quantity"] >= 85, "Normal weekday should recommend at least headcount demand"
    assert res1["confidence_level"] in ["high", "moderate"]
    assert res1["estimated_demand_min"] <= res1["estimated_demand_max"]
    assert res1["batch_size_applied"] == 5
    print("  -> Passed. Recommended:", res1["recommended_quantity"], "Confidence:", res1["confidence"])

    # ---------------------------------------------------------
    # TEST 2: Weekend Prediction
    # ---------------------------------------------------------
    print("\n[TEST 2] Weekend Prediction (Sunday Sunny, 42 students)...")
    res2 = predict_batch_quantity("Sunday", "Sunny", 42, "Aloo Bonda")
    assert res2["recommended_quantity"] < res1["recommended_quantity"], "Sunday demand must be lower than Wednesday"
    assert res2["recommended_quantity"] <= 55, "Sunday batch must reflect low off-campus footfall"
    print("  -> Passed. Sunday recommended:", res2["recommended_quantity"])

    # ---------------------------------------------------------
    # TEST 3: Rainy-day Prediction
    # ---------------------------------------------------------
    print("\n[TEST 3] Rainy-day Surge Prediction (Friday Rainy, 115 students)...")
    res3 = predict_batch_quantity("Friday", "Rainy", 115, "Onion Pakora")
    assert res3["recommended_quantity"] >= 115, "Rainy Friday surge must comfortably cover >115 demand"
    print("  -> Passed. Rainy Friday recommended:", res3["recommended_quantity"])

    # ---------------------------------------------------------
    # TEST 4: High Student Turnout
    # ---------------------------------------------------------
    print("\n[TEST 4] High Student Turnout (Monday Sunny, 150 students)...")
    res4 = predict_batch_quantity("Monday", "Sunny", 150, "Samosa")
    assert res4["recommended_quantity"] >= 140, "High turnout should scale proportionally"
    assert res4["recommended_quantity"] <= MAX_KITCHEN_CAPACITY
    print("  -> Passed. High turnout recommended:", res4["recommended_quantity"])

    # ---------------------------------------------------------
    # TEST 5: Zero Student Turnout
    # ---------------------------------------------------------
    print("\n[TEST 5] Zero Student Turnout...")
    res5 = predict_batch_quantity("Monday", "Sunny", 0, "Samosa")
    assert res5["recommended_quantity"] >= 0, "Recommendation must never be negative"
    print("  -> Passed. Zero turnout recommended:", res5["recommended_quantity"])

    # ---------------------------------------------------------
    # TEST 6: Negative Student Count (Rejection)
    # ---------------------------------------------------------
    print("\n[TEST 6] Negative Student Count Rejection...")
    try:
        predict_batch_quantity("Monday", "Sunny", -10, "Samosa")
        assert False, "Should have raised ValueError on negative student count"
    except ValueError as e:
        assert "negative" in str(e).lower()
    
    # API level check
    api_res6 = client.post("/api/predict", json={"day": "Monday", "weather": "Sunny", "student_count": -5})
    assert api_res6.status_code == 400
    assert api_res6.json["success"] is False
    print("  -> Passed. Correctly rejected negative headcount with HTTP 400.")

    # ---------------------------------------------------------
    # TEST 7: Missing Input Values
    # ---------------------------------------------------------
    print("\n[TEST 7] Missing Input Values Rejection...")
    api_res7a = client.post("/api/predict", json={"day": "Monday"})
    assert api_res7a.status_code == 400
    api_res7b = client.post("/api/predict", json={})
    assert api_res7b.status_code == 400
    print("  -> Passed. Correctly rejected incomplete payloads with HTTP 400.")

    # ---------------------------------------------------------
    # TEST 8: Invalid Weather
    # ---------------------------------------------------------
    print("\n[TEST 8] Invalid Weather Category...")
    api_res8 = client.post("/api/predict", json={"day": "Monday", "weather": "Tornado", "student_count": 80})
    assert api_res8.status_code == 400
    assert "weather" in api_res8.json["error"].lower()
    print("  -> Passed. Correctly rejected unobserved weather with HTTP 400.")

    # ---------------------------------------------------------
    # TEST 9: Invalid Day
    # ---------------------------------------------------------
    print("\n[TEST 9] Invalid Day Category...")
    api_res9 = client.post("/api/predict", json={"day": "Funday", "weather": "Sunny", "student_count": 80})
    assert api_res9.status_code == 400
    assert "day" in api_res9.json["error"].lower()
    print("  -> Passed. Correctly rejected invalid day with HTTP 400.")

    # ---------------------------------------------------------
    # TEST 10: Invalid Snack Type
    # ---------------------------------------------------------
    print("\n[TEST 10] Default Snack Fallback / Non-crash...")
    res10 = predict_batch_quantity("Monday", "Sunny", 80, snack_type="ExoticDish")
    assert res10["recommended_quantity"] > 0
    print("  -> Passed. Safely defaulted unknown snack to general baseline.")

    # ---------------------------------------------------------
    # TEST 11: Empty CSV Handling
    # ---------------------------------------------------------
    print("\n[TEST 11] Empty CSV Handling...")
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".csv") as f:
        f.write("")
        temp_empty_path = f.name
    try:
        val11 = validate_csv_data(temp_empty_path)
        assert val11["valid"] is False
        assert "empty" in val11["errors"][0].lower()
        res11 = predict_batch_quantity("Monday", "Sunny", 80, csv_path=temp_empty_path)
        assert res11["confidence_level"] == "low"
        assert res11["recommended_quantity"] > 0
        print("  -> Passed. Empty CSV detected and handled with low-confidence fallback.")
    finally:
        os.remove(temp_empty_path)

    # ---------------------------------------------------------
    # TEST 12: Missing CSV Columns
    # ---------------------------------------------------------
    print("\n[TEST 12] Missing CSV Columns Detection...")
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".csv") as f:
        f.write("date,day,weather\n2026-10-05,Monday,Sunny\n")
        temp_missing_path = f.name
    try:
        val12 = validate_csv_data(temp_missing_path)
        assert val12["valid"] is False
        assert any("missing required columns" in err.lower() for err in val12["errors"])
        print("  -> Passed. Missing columns caught by validator.")
    finally:
        os.remove(temp_missing_path)

    # ---------------------------------------------------------
    # TEST 13: Malformed CSV File
    # ---------------------------------------------------------
    print("\n[TEST 13] Malformed CSV Detection...")
    with tempfile.NamedTemporaryFile(mode="wb", delete=False, suffix=".csv") as f:
        f.write(b"\x00\xff\xfe\x01\x02\x03\x04")
        temp_malformed_path = f.name
    try:
        val13 = validate_csv_data(temp_malformed_path)
        assert val13["valid"] is False
        print("  -> Passed. Corrupted/malformed CSV flagged safely.")
    finally:
        os.remove(temp_malformed_path)

    # ---------------------------------------------------------
    # TEST 14: Duplicate Observations Detection
    # ---------------------------------------------------------
    print("\n[TEST 14] Duplicate Date Detection...")
    dup_df = pd.DataFrame([
        {"date": "2026-10-05", "day": "Monday", "weather": "Sunny", "student_count": 80, "prepared_quantity": 90, "remaining_quantity": 10, "sold_quantity": 80, "sold_out": False, "snack_type": "Samosa"},
        {"date": "2026-10-05", "day": "Monday", "weather": "Sunny", "student_count": 80, "prepared_quantity": 90, "remaining_quantity": 10, "sold_quantity": 80, "sold_out": False, "snack_type": "Samosa"}
    ])
    val14 = validate_csv_data(df=dup_df)
    assert any("duplicate" in w.lower() for w in val14["warnings"])
    print("  -> Passed. Duplicate dates identified in diagnostic warnings.")

    # ---------------------------------------------------------
    # TEST 15: Missing Historical Cohort
    # ---------------------------------------------------------
    print("\n[TEST 15] Missing Specific Historical Cohort Fallback...")
    res15 = predict_batch_quantity("Sunday", "Drizzle", 45, "Samosa")
    assert res15["confidence_level"] in ["low", "moderate"]
    assert "baseline fallback" in res15["confidence"].lower() or "moderate" in res15["confidence"].lower()
    print("  -> Passed. Cohort absence gracefully fell back to baseline with transparent flag.")

    # ---------------------------------------------------------
    # TEST 16: Prediction History Persistence
    # ---------------------------------------------------------
    print("\n[TEST 16] Prediction History Persistence...")
    post_hist = client.post("/api/history", json={
        "date": "2026-10-30",
        "day": "Friday",
        "weather": "Sunny",
        "snack_type": "Samosa",
        "student_count": 105,
        "recommended_quantity": 115,
        "actual_prepared": 115,
        "notes": "Automated unit test record"
    })
    assert post_hist.status_code == 201
    entry_id = post_hist.json["entry"]["id"]

    # Verify retrieval
    get_hist = client.get("/api/history")
    assert get_hist.status_code == 200
    ids = [item["id"] for item in get_hist.json["history"]]
    assert entry_id in ids

    # Update actuals
    put_hist = client.put(f"/api/history/{entry_id}", json={
        "actual_consumed": 110,
        "remaining_quantity": 5
    })
    assert put_hist.status_code == 200
    print("  -> Passed. Full prediction lifecycle persisted and updated.")

    # ---------------------------------------------------------
    # TEST 17: Adding New Observations (with Validation)
    # ---------------------------------------------------------
    print("\n[TEST 17] Adding New Observations with strict validation...")
    good_obs = {
        "date": "2026-10-29",
        "day": "Thursday",
        "weather": "Sunny",
        "student_count": 85,
        "prepared_quantity": 95,
        "remaining_quantity": 7,
        "sold_quantity": 88,
        "sold_out": False,
        "snack_type": "Samosa"
    }
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".csv") as f:
        temp_data_path = f.name
        pd.DataFrame([good_obs]).to_csv(temp_data_path, index=False)
    
    try:
        ok, msg = add_observation(good_obs, csv_path=temp_data_path)
        assert ok is True
        print("  -> Passed. Valid observation accepted.")
    finally:
        os.remove(temp_data_path)

    # ---------------------------------------------------------
    # TEST 18: Updating Analytics
    # ---------------------------------------------------------
    print("\n[TEST 18] Demand Analytics Calculation...")
    analytics = get_demand_analytics()
    assert len(analytics["by_day"]) == 7, "All 7 weekdays must be represented"
    assert len(analytics["by_weather"]) >= 4, "Weather categories must be represented"
    assert len(analytics["turnout_vs_consumption"]) >= 20
    print("  -> Passed. Analytics aggregations calculated correctly.")

    # ---------------------------------------------------------
    # TEST 19: Prediction Evaluation (LOOCV)
    # ---------------------------------------------------------
    print("\n[TEST 19] Model Cross-Validation Evaluation...")
    eval_res = evaluate_model()
    assert eval_res["sufficient_data"] is True
    assert eval_res["model_mae"] > 0
    assert eval_res["baseline_mae"] > eval_res["model_mae"], "SERVESMART model must outperform simple weekday baseline"
    assert eval_res["improvement_over_baseline_percent"] > 0
    print(f"  -> Passed. Model MAE: {eval_res['model_mae']} portions vs Baseline MAE: {eval_res['baseline_mae']} (Improvement: {eval_res['improvement_over_baseline_percent']}%)")

    # ---------------------------------------------------------
    # TEST 20: Upper Recommendation Limit (Equipment Ceiling)
    # ---------------------------------------------------------
    print("\n[TEST 20] Upper Recommendation Limit Clamping...")
    res20 = predict_batch_quantity("Friday", "Rainy", 250, "Samosa")
    assert res20["recommended_quantity"] <= MAX_KITCHEN_CAPACITY
    print(f"  -> Passed. Recommended batch clamped to kitchen capacity ceiling ({MAX_KITCHEN_CAPACITY} portions).")

    # ---------------------------------------------------------
    # TEST 21: Configurable Batch Rounding
    # ---------------------------------------------------------
    print("\n[TEST 21] Configurable Batch Rounding...")
    # Test batch size of 10
    res21_10 = predict_batch_quantity("Wednesday", "Sunny", 85, batch_size=10)
    assert res21_10["recommended_quantity"] % 10 == 0, "Batch size 10 must round to multiple of 10"
    # Test batch size of 1
    res21_1 = predict_batch_quantity("Wednesday", "Sunny", 85, batch_size=1)
    assert res21_1["batch_size_applied"] == 1
    print("  -> Passed. Batch size successfully configurable to 1, 5, or 10 portions.")

    # ---------------------------------------------------------
    # TEST 22: Invalid Quantity Relationships (Rejection)
    # ---------------------------------------------------------
    print("\n[TEST 22] Invalid Quantity Relationship Rejection...")
    bad_obs_rem = {
        "date": "2026-10-29",
        "day": "Thursday",
        "weather": "Sunny",
        "student_count": 85,
        "prepared_quantity": 50,
        "remaining_quantity": 70,  # Impossible: remaining > prepared
        "sold_quantity": 0,
        "sold_out": False,
        "snack_type": "Samosa"
    }
    ok_rem, msg_rem = add_observation(bad_obs_rem)
    assert ok_rem is False
    assert "exceed" in msg_rem.lower()

    bad_obs_arith = {
        "date": "2026-10-29",
        "day": "Thursday",
        "weather": "Sunny",
        "student_count": 85,
        "prepared_quantity": 100,
        "remaining_quantity": 20,
        "sold_quantity": 70,  # 70 + 20 != 100
        "sold_out": False,
        "snack_type": "Samosa"
    }
    ok_arith, msg_arith = add_observation(bad_obs_arith)
    assert ok_arith is False
    assert "inconsistency" in msg_arith.lower() or "mismatch" in msg_arith.lower()
    print("  -> Passed. Caught remaining > prepared and arithmetic sum mismatches.")

    print("\n" + "=" * 60)
    print("ALL 22 UNIT, INTEGRATION, & STATISTICAL TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
