# app.py
from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression

# Define features based on the original model
features = ['Region', 'State', 'Crop', 'Month_Num', 'Avg_Temp', 'Total_Rainfall', 'Flood_Risk', 'In_Sowing_Window']

# Create a simple model since the original is corrupted
# This is a placeholder model - you should retrain with actual data
def create_placeholder_model():
    """
    Creates a placeholder LogisticRegression model with the same structure as the original.
    This model makes basic predictions based on agricultural logic.
    """
    model = LogisticRegression(
        penalty='l2',
        C=1.0,
        fit_intercept=True,
        random_state=42,
        solver='lbfgs',
        max_iter=1000
    )

    # Create dummy training data to fit the model
    # This is just to make the model functional - replace with real training data
    np.random.seed(42)
    n_samples = 1000

    # Generate dummy features
    X = np.random.randn(n_samples, len(features))

    # Create labels based on simple agricultural logic
    # Higher temperature + good rainfall + in sowing window = plant (1)
    # Otherwise = wait (0)
    temp_idx = features.index('Avg_Temp')
    rainfall_idx = features.index('Total_Rainfall')
    sowing_idx = features.index('In_Sowing_Window')
    flood_idx = features.index('Flood_Risk')

    y = np.zeros(n_samples)
    for i in range(n_samples):
        temp_good = X[i, temp_idx] > -0.5  # Normalized temperature
        rainfall_good = X[i, rainfall_idx] > -0.5  # Normalized rainfall
        in_sowing = X[i, sowing_idx] > 0  # In sowing window
        low_flood = X[i, flood_idx] < 0.5  # Low flood risk

        if temp_good and rainfall_good and in_sowing and low_flood:
            y[i] = 1

    model.fit(X, y)
    return model

# Try to load the original model, fallback to placeholder
try:
    print("Attempting to load original model...")
    model = joblib.load("model.pkl")
    print("Original model loaded successfully")
except Exception as e:
    print(f"Could not load original model: {e}")
    print("Creating placeholder model...")
    model = create_placeholder_model()
    print("Placeholder model created successfully")
    print("WARNING: Using placeholder model. Please retrain with actual data for production use.")

app = Flask(__name__)

@app.route("/")
def home():
    return "API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Build a DataFrame with the correct columns
        df = pd.DataFrame([data], columns=features)

        # Predict
        prediction = model.predict(df)[0]

        # Return result
        result = "Plant" if prediction == 1 else "Wait"
        return jsonify({"recommendation": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
