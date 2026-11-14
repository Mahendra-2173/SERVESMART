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
    DEFAULT_DATA_PATH
)
from predictor import predict_batch_quantity

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
    return jsonify({"status": "healthy", "service": "MessMate API", "version": "1.0.0"})

@app.route("/api/stats", methods=["GET"])
def stats():
    try:
        data = get_summary_stats()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/analytics", methods=["GET"])
def analytics():
    try:
        data = get_demand_analytics()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        body = request.get_json() or {}
        day = body.get("day")
        weather = body.get("weather")
        student_count = body.get("student_count")
        snack_type = body.get("snack_type", "Samosa")

        if not day or not weather or student_count is None:
            return jsonify({"success": False, "error": "Missing required fields: day, weather, student_count"}), 400

        try:
            student_count = int(student_count)
            if student_count < 0:
                return jsonify({"success": False, "error": "Student count cannot be negative"}), 400
        except ValueError:
            return jsonify({"success": False, "error": "Student count must be an integer"}), 400

        result = predict_batch_quantity(day, weather, student_count, snack_type)
        return jsonify({"success": True, "prediction": result})
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
            return jsonify({"success": False, "error": "Data file not found"}), 404
        return send_file(
            DEFAULT_DATA_PATH,
            mimetype="text/csv",
            as_attachment=True,
            download_name="messmate_fieldwork_data.csv"
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
            return jsonify({"success": False, "error": "Prediction record not found"}), 404
        save_predictions(preds)
        return jsonify({"success": True, "message": "Prediction actuals updated successfully."})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
