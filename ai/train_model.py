import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
import pickle

# STEP 1 — Load cleaned dataset
data = pd.read_csv("cleaned_data.csv")

# STEP 2 — Define features (inputs)
X = data[[
    "Age",
    "SystolicBP",
    "DiastolicBP",
    "Sugar",
    "BodyTemp",
    "HeartRate"
]]

# STEP 3 — Define target (output)
y = data["Risk"]

# STEP 4 — Split data (train/test)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# STEP 5 — Create model
model = DecisionTreeClassifier()

# STEP 6 — Train model
model.fit(X_train, y_train)

# STEP 7 — Check accuracy (important for demo)
accuracy = model.score(X_test, y_test)
print(f"✅ Model Accuracy: {accuracy * 100:.2f}%")

# STEP 8 — Save model
pickle.dump(model, open("model.pkl", "wb"))

print("✅ Model saved as model.pkl")