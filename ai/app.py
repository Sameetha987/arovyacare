from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained model
model = pickle.load(open("model.pkl", "rb"))

# ─────────────────────────────────────────────
# CLINICAL SAFE RANGES (pregnancy-specific)
# ─────────────────────────────────────────────
RANGES = {
    "systolic":  {"low": 90,   "high": 140},
    "diastolic": {"low": 60,   "high": 90},
    "sugar":     {"low": 70,   "high": 160},
    "temp":      {"low": 96,   "high": 100.4},
    "heartrate": {"low": 60,   "high": 100},
}

def analyze_vitals(data):
    """Return flags for abnormal vitals."""
    s  = float(data.get("systolic",  110))
    d  = float(data.get("diastolic", 70))
    su = float(data.get("sugar",     100))
    t  = float(data.get("temp",      98))
    hr = float(data.get("heartrate", 75))

    return {
        "high_bp":    s  > RANGES["systolic"]["high"],
        "low_bp":     s  < RANGES["systolic"]["low"],
        "high_dias":  d  > RANGES["diastolic"]["high"],
        "low_dias":   d  < RANGES["diastolic"]["low"],
        "high_sugar": su > RANGES["sugar"]["high"],
        "low_sugar":  su < RANGES["sugar"]["low"],
        "crit_sugar": su > 250,
        "high_hr":    hr > RANGES["heartrate"]["high"],
        "low_hr":     hr < RANGES["heartrate"]["low"],
        "crit_hr":    hr > 130,
        "high_temp":  t  > RANGES["temp"]["high"],
        "low_temp":   t  < RANGES["temp"]["low"],
        "crit_temp":  t  > 103,
    }

def rule_based_risk(data):
    """
    Pure rule-based risk from vitals only.
    Returns: "High" | "Medium" | "Low" and a score
    """
    f = analyze_vitals(data)
    score = 0

    # Critical vitals → immediate High
    if f["crit_sugar"]: score += 6
    elif f["high_sugar"] or f["low_sugar"]: score += 3

    if f["high_bp"] and f["high_dias"]: score += 6   # both elevated
    elif f["high_bp"] or f["low_bp"]:   score += 3

    if f["crit_hr"]:              score += 5
    elif f["high_hr"] or f["low_hr"]: score += 2

    if f["crit_temp"]:            score += 5
    elif f["high_temp"] or f["low_temp"]: score += 2

    if score >= 14: return "High",    score
    if score >= 7:  return "Medium",  score
    if score >= 3:  return "Low",     score
    return          "Healthy",        score


def normalize_ml_output(raw_prediction):
    p = str(raw_prediction).lower().strip()
    if "high" in p or p == "3":   return "High"
    if "medium" in p or "mid" in p or p == "2": return "Medium"
    if "low" in p or p == "1":    return "Low"
    return "Healthy"


def combine_risks(rule_risk, ml_risk, rule_score):
    level_map   = {"Healthy": 0, "Low": 1, "Medium": 2, "High": 3}
    level_words = ["Healthy", "Low", "Medium", "High"]

    rule_level = level_map.get(rule_risk, 0)
    ml_level   = level_map.get(ml_risk,   0)

    # Normal vitals → ML cannot push above Low
    if rule_score <= 2 and ml_level >= 2:
        print(f"⚠️  Vitals normal (score={rule_score}), ML={ml_risk} → Healthy")
        return "Healthy"

    # Mild score → ML cannot push to High
    if rule_score <= 4 and ml_level >= 3:
        print(f"⚠️  Mild score ({rule_score}), capping ML High → Low")
        return "Low"

    # Rule says High → always High
    if rule_level == 3:
        return "High"

    # They agree
    if rule_level == ml_level:
        return level_words[rule_level]

    # Within 1 step → take higher
    if abs(rule_level - ml_level) == 1:
        return level_words[max(rule_level, ml_level)]

    # Strongly disagree → rule wins, nudge +1
    final = min(rule_level + 1, 3)
    return level_words[final]



@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    if not data:
        return jsonify({"error": "No data provided"}), 400

    # ── 1. Rule-based check first
    rule_risk, rule_score = rule_based_risk(data)
    print(f"📋 Rule risk: {rule_risk} (score={rule_score})")

    # ── 2. ML prediction
    try:
        features = [[
            float(data.get("age",       25)),
            float(data.get("systolic",  110)),
            float(data.get("diastolic", 70)),
            float(data.get("sugar",     100)),
            float(data.get("temp",      98)),
            float(data.get("heartrate", 75)),
        ]]

        raw_prediction = model.predict(features)[0]
        ml_risk = normalize_ml_output(raw_prediction)
        print(f"🤖 ML raw: {raw_prediction} → normalized: {ml_risk}")

    except Exception as e:
        print(f"❌ ML prediction failed: {e}")
        # ML failed → use rule engine only
        return jsonify({
            "risk":       rule_risk,
            "rule_risk":  rule_risk,
            "ml_risk":    None,
            "rule_score": rule_score,
            "source":     "rule_only",
        })

    # ── 3. Combine intelligently
    final_risk = combine_risks(rule_risk, ml_risk, rule_score)
    print(f"✅ Final risk: {final_risk}")

    return jsonify({
        "risk":       final_risk,      # ← this is what React uses
        "rule_risk":  rule_risk,
        "ml_risk":    ml_risk,
        "rule_score": rule_score,
        "source":     "combined",
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "loaded"})


if __name__ == "__main__":
    app.run(debug=True)
