import json
from app import app
from predictor import predict_batch_quantity
from data_processor import load_data, get_summary_stats, get_demand_analytics

def run_tests():
    print("=== TEST 1: Load Data & Summary Stats ===")
    df = load_data()
    print(f"Loaded {len(df)} rows from data.csv")
    assert len(df) >= 20, "Dataset must have at least 20 observations"
    stats = get_summary_stats(df)
    print("Summary Stats:", stats)
    assert stats["total_observations"] >= 20
    assert stats["avg_daily_consumption"] > 0
    assert stats["days_ran_out"] > 0

    print("\n=== TEST 2: Demand Analytics ===")
    analytics = get_demand_analytics(df)
    print(f"By Day categories: {len(analytics['by_day'])}")
    print(f"By Weather categories: {len(analytics['by_weather'])}")
    assert len(analytics["by_day"]) > 0
    assert len(analytics["by_weather"]) > 0

    print("\n=== TEST 3: Direct Prediction Logic ===")
    # Scenario A: Normal weekday turnout
    p1 = predict_batch_quantity("Wednesday", "Sunny", 80, "Samosa")
    print("Normal Weekday Prediction:", p1["recommended_quantity"], p1["confidence"])
    assert p1["recommended_quantity"] > 0
    assert p1["estimated_demand_min"] <= p1["estimated_demand_max"]

    # Scenario B: Weekend turnout
    p2 = predict_batch_quantity("Sunday", "Sunny", 42, "Aloo Bonda")
    print("Weekend Turnout Prediction:", p2["recommended_quantity"], p2["confidence"])
    assert p2["recommended_quantity"] < p1["recommended_quantity"], "Sunday demand should be lower than Wednesday"

    # Scenario C: Rainy day surge
    p3 = predict_batch_quantity("Friday", "Rainy", 115, "Onion Pakora")
    print("Rainy Friday Surge Prediction:", p3["recommended_quantity"], p3["confidence"])
    assert p3["recommended_quantity"] > 100

    # Scenario D: Unusually high student turnout
    p4 = predict_batch_quantity("Monday", "Sunny", 180, "Samosa")
    print("Extreme High Turnout Prediction:", p4["recommended_quantity"])
    assert p4["recommended_quantity"] <= 180

    # Scenario E: Zero turnout
    p5 = predict_batch_quantity("Monday", "Sunny", 0, "Samosa")
    print("Zero Turnout Prediction:", p5["recommended_quantity"])
    assert p5["recommended_quantity"] >= 15

    print("\n=== TEST 4: Flask API Endpoints via test_client ===")
    client = app.test_client()
    
    # /api/health
    res = client.get("/api/health")
    assert res.status_code == 200
    print("Health check OK")

    # /api/stats
    res = client.get("/api/stats")
    assert res.status_code == 200
    assert res.json["success"] is True
    print("Stats API OK")

    # /api/analytics
    res = client.get("/api/analytics")
    assert res.status_code == 200
    assert res.json["success"] is True
    print("Analytics API OK")

    # /api/predict
    res = client.post("/api/predict", json={
        "day": "Wednesday",
        "weather": "Sunny",
        "student_count": 85,
        "snack_type": "Samosa"
    })
    assert res.status_code == 200
    assert res.json["success"] is True
    assert "prediction" in res.json
    print("Predict API OK:", res.json["prediction"]["recommended_quantity"])

    # Invalid input checks
    res_err1 = client.post("/api/predict", json={"day": "Wednesday"})
    assert res_err1.status_code == 400
    res_err2 = client.post("/api/predict", json={"day": "Wednesday", "weather": "Sunny", "student_count": -5})
    assert res_err2.status_code == 400
    print("Validation Error checks OK")

    # /api/data GET & POST
    res_data = client.get("/api/data")
    assert res_data.status_code == 200
    assert res_data.json["count"] >= 20
    print("Data GET API OK")

    # /api/history GET
    res_hist = client.get("/api/history")
    assert res_hist.status_code == 200
    print("History API OK")

    print("\nALL BACKEND UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
