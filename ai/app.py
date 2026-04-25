from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Load trained model
model = pickle.load(open("model.pkl", "rb"))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    # Extract features
    features = [[
        data["age"],
        data["systolic"],
        data["diastolic"],
        data["sugar"],
        data["temp"],
        data["heartrate"]
    ]]

    # Predict
    prediction = model.predict(features)[0]

    return jsonify({
        "risk": prediction
    })

if __name__ == "__main__":
    app.run(debug=True)