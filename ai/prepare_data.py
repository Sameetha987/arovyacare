import pandas as pd

# STEP 1 — Load dataset
data = pd.read_csv("maternal_health.csv")

# STEP 2 — Show first rows
print("🔹 First 5 rows:")
print(data.head())

# STEP 3 — Rename columns (clean names)
data = data.rename(columns={
    "BS": "Sugar",
    "RiskLevel": "Risk"
})

# STEP 4 — Check missing values
print("\n🔹 Missing values:")
print(data.isnull().sum())

# STEP 5 — Check unique risk labels
print("\n🔹 Risk values:")
print(data["Risk"].unique())

# STEP 6 — Convert risk labels to lowercase (important)
data["Risk"] = data["Risk"].str.lower()

# STEP 7 — Save cleaned dataset
data.to_csv("cleaned_data.csv", index=False)

print("\n✅ Cleaned dataset saved as cleaned_data.csv")