import os
import json
import uuid
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from data_processor import (
    load_data,
    get_summary_stats,
    get_demand_analytics,
    add_observation,
    validate_csv_data,
    DEFAULT_DATA_PATH,
    VALID_DAYS,
    VALID_WEATHER,
    VALID_SNACKS
)
from predictor import (
    predict_batch_quantity,
    evaluate_model,
    MAX_KITCHEN_CAPACITY,
    MIN_VIABLE_BATCH,
    DEFAULT_BATCH_SIZE,
    DEFAULT_SAFETY_BUFFER
)

app = Flask(__name__)
CORS(app)

PREDICTIONS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "predictions.json")

def load_predictions():
    if not os.path.exists(PREDICTIONS_PATH):
        return []
    try:
        with open(PREDICTIONS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading predictions: {e}")
        return []

def save_predictions(preds):
    try:
        with open(PREDICTIONS_PATH, "w", encoding="utf-8") as f:
            json.dump(preds, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving predictions: {e}")
        return False

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "SERVESMART API",
        "version": "2.0.0",
        "branding": "SERVESMART – Smart Food Demand & Batch Prediction System"
    })

@app.route("/api/stats", methods=["GET"])
def stats():
    try:
        data = get_summary_stats()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    try:
        stats_data = get_summary_stats()
        history_data = load_predictions()[:5]  # 5 most recent
        eval_data = evaluate_model()
        return jsonify({
            "success": True,
            "data": {
                "stats": stats_data,
                "recent_history": history_data,
                "evaluation_summary": {
                    "model_mae": eval_data.get("model_mae"),
                    "baseline_mae": eval_data.get("baseline_mae"),
                    "improvement_percent": eval_data.get("improvement_over_baseline_percent"),
                    "validation_method": eval_data.get("validation_method")
                }
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/analytics", methods=["GET"])
def analytics():
    try:
        data = get_demand_analytics()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/evaluation", methods=["GET"])
def evaluation():
    try:
        eval_results = evaluate_model()
        return jsonify({"success": True, "evaluation": eval_results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/validate", methods=["GET"])
def validate_dataset():
    try:
        val_results = validate_csv_data()
        return jsonify({"success": True, "report": val_results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/predict", methods=["GET"])
def predict_info():
    """Returns documentation of the explainable prediction parameters."""
    return jsonify({
        "success": True,
        "engine": "SERVESMART Proportional Heuristic Engine",
        "parameters": {
            "day": f"One of {VALID_DAYS}",
            "weather": f"One of {VALID_WEATHER}",
            "student_count": "Non-negative integer (5:00 PM - 6:00 PM entrance headcount)",
            "snack_type": f"Optional snack type ({VALID_SNACKS})",
            "safety_buffer": f"Optional integer safety margin (default: {DEFAULT_SAFETY_BUFFER} portions)",
            "batch_size": f"Optional rounding increment (default: {DEFAULT_BATCH_SIZE} portions)"
        },
        "equipment_limits": {
            "max_kitchen_capacity": MAX_KITCHEN_CAPACITY,
            "min_viable_batch": MIN_VIABLE_BATCH
        }
    })

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        body = request.get_json() or {}
        day = body.get("day")
        weather = body.get("weather")
        student_count = body.get("student_count")
        snack_type = body.get("snack_type", "Samosa")
        safety_buffer = body.get("safety_buffer")
        batch_size = body.get("batch_size")

        if not day or not weather or student_count is None:
            return jsonify({
                "success": False, 
                "error": "Missing required fields: 'day', 'weather', and 'student_count' are mandatory."
            }), 400

        try:
            student_count = int(student_count)
            if student_count < 0:
                return jsonify({"success": False, "error": "Student count cannot be negative."}), 400
            if student_count > 1000:
                return jsonify({"success": False, "error": "Unreasonably high student count. Must be <= 1000."}), 400
        except (ValueError, TypeError):
            return jsonify({"success": False, "error": "Student count must be a valid integer."}), 400

        # Validate day and weather
        clean_day = str(day).strip().capitalize()
        if clean_day not in VALID_DAYS:
            return jsonify({"success": False, "error": f"Invalid day '{day}'. Must be one of {VALID_DAYS}."}), 400

        clean_weather = str(weather).strip().capitalize()
        if clean_weather not in VALID_WEATHER:
            return jsonify({"success": False, "error": f"Invalid weather '{weather}'. Must be one of {VALID_WEATHER}."}), 400

        result = predict_batch_quantity(
            clean_day, 
            clean_weather, 
            student_count, 
            snack_type=snack_type,
            safety_buffer=safety_buffer,
            batch_size=batch_size
        )
        return jsonify({"success": True, "prediction": result})
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/data", methods=["GET"])
def get_data():
    try:
        df = load_data()
        records = df.to_dict(orient="records")
        return jsonify({"success": True, "count": len(records), "data": records})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/data", methods=["POST"])
@app.route("/api/observations", methods=["POST"])
def post_data():
    try:
        record = request.get_json() or {}
        success, message = add_observation(record)
        if not success:
            return jsonify({"success": False, "error": message}), 400
        return jsonify({"success": True, "message": message}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/export", methods=["GET"])
def export_csv():
    try:
        if not os.path.exists(DEFAULT_DATA_PATH):
            return jsonify({"success": False, "error": "Data file not found."}), 404
        return send_file(
            DEFAULT_DATA_PATH,
            mimetype="text/csv",
            as_attachment=True,
            download_name="servesmart_fieldwork_data.csv"
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/history", methods=["GET"])
def get_history():
    try:
        preds = load_predictions()
        return jsonify({"success": True, "count": len(preds), "history": preds})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/history", methods=["POST"])
def post_history():
    try:
        item = request.get_json() or {}
        preds = load_predictions()
        new_entry = {
            "id": f"pred-{uuid.uuid4().hex[:8]}",
            "date": item.get("date", ""),
            "day": item.get("day", ""),
            "weather": item.get("weather", ""),
            "snack_type": item.get("snack_type", "Samosa"),
            "student_count": int(item.get("student_count", 0)),
            "recommended_quantity": int(item.get("recommended_quantity", 0)),
            "actual_prepared": int(item.get("actual_prepared", item.get("recommended_quantity", 0))),
            "actual_consumed": item.get("actual_consumed"),
            "remaining_quantity": item.get("remaining_quantity"),
            "status": "Logged" if item.get("actual_consumed") is None else "Evaluated",
            "notes": item.get("notes", "")
        }
        preds.insert(0, new_entry)
        save_predictions(preds)
        return jsonify({"success": True, "entry": new_entry}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/history/<item_id>", methods=["PUT"])
def update_history(item_id):
    try:
        body = request.get_json() or {}
        preds = load_predictions()
        found = False
        for p in preds:
            if p.get("id") == item_id:
                if "actual_prepared" in body:
                    p["actual_prepared"] = int(body["actual_prepared"])
                if "actual_consumed" in body:
                    p["actual_consumed"] = int(body["actual_consumed"])
                if "remaining_quantity" in body:
                    p["remaining_quantity"] = int(body["remaining_quantity"])
                if "notes" in body:
                    p["notes"] = str(body["notes"])
                p["status"] = "Evaluated"
                found = True
                break
        if not found:
            return jsonify({"success": False, "error": "Prediction record not found."}), 404
        save_predictions(preds)
        return jsonify({"success": True, "message": "Prediction actuals updated successfully."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
