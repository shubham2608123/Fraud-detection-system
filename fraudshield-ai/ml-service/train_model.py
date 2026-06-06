import os, joblib, numpy as np, pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, f1_score, precision_recall_curve
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "DataSet (1).csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "model-files")

print("=" * 60)
print("FraudShield AI - Model Training")
print("=" * 60)

print("\n[1/8] Loading dataset...")
df = pd.read_csv(DATASET_PATH)
if "Unnamed: 0" in df.columns:
    df = df.drop("Unnamed: 0", axis=1)

y = df["F3924"].values
X_raw = df.drop(columns=["F3924"])
ACTUAL_MULE_COUNT = int(np.sum(y == 1))
print(f"  Shape: {df.shape}")
print(f"  Mule accounts: {ACTUAL_MULE_COUNT}")
print(f"  Legitimate accounts: {np.sum(y==0)}")

print("\n[2/8] Handling missing values...")
num_cols = X_raw.select_dtypes(include=[np.number]).columns.tolist()
cat_cols = X_raw.select_dtypes(include=["object"]).columns.tolist()

imputation_values = {}
for col in num_cols:
    median_val = X_raw[col].median()
    X_raw[col] = X_raw[col].fillna(median_val)
    imputation_values[col] = float(median_val)

for col in cat_cols:
    mode_val = X_raw[col].mode()[0] if len(X_raw[col].mode()) > 0 else "unknown"
    X_raw[col] = X_raw[col].fillna(mode_val)
    imputation_values[col] = str(mode_val)

print(f"  Numeric: {len(num_cols)}, Categorical: {len(cat_cols)}")

print("\n[3/8] Encoding categorical columns...")
label_encoders = {}
for col in cat_cols:
    le = LabelEncoder()
    X_raw[col] = le.fit_transform(X_raw[col].astype(str))
    label_encoders[col] = le

print("\n[4/8] Feature selection with RandomForest...")
rf_selector = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
rf_selector.fit(X_raw, y)

importance = pd.Series(rf_selector.feature_importances_, index=X_raw.columns)
top_features = importance.sort_values(ascending=False).head(100)
selected_features = top_features.index.tolist()
X_selected = X_raw[selected_features]
print(f"  Selected {len(selected_features)} features")

print("\n[5/8] Train/test split...")
X_train, X_test, y_train, y_test = train_test_split(
    X_selected, y, test_size=0.2, stratify=y, random_state=42
)
print(f"  Train: {X_train.shape[0]} ({np.sum(y_train==1)} mule)")
print(f"  Test: {X_test.shape[0]} ({np.sum(y_test==1)} mule)")

print("\n[6/8] Applying SMOTE...")
smote = SMOTE(random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)
print(f"  After SMOTE: {np.sum(y_train_res==0)} legit, {np.sum(y_train_res==1)} mule")

print("\n[7/8] Scaling...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_res)
X_test_scaled = scaler.transform(X_test)

print("\n[8/8] Training XGBoost...")
spw = np.sum(y_train_res == 0) / max(np.sum(y_train_res == 1), 1)
model = XGBClassifier(
    n_estimators=500, max_depth=6, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8,
    min_child_weight=3, gamma=0.1, reg_alpha=0.1, reg_lambda=1.0,
    scale_pos_weight=spw, random_state=42, eval_metric="logloss",
    use_label_encoder=False, tree_method="hist", n_jobs=-1,
)
model.fit(X_train_scaled, y_train_res)

print("\n" + "=" * 60)
print("Finding Optimal Threshold")
print("=" * 60)

X_all_scaled = scaler.transform(X_selected)
all_probs = model.predict_proba(X_all_scaled)[:, 1]

thresholds = np.arange(0.1, 0.9, 0.001)
best_threshold = 0.5
best_diff = float('inf')
best_f1 = 0

for t in thresholds:
    preds = (all_probs >= t).astype(int)
    detected = int(np.sum(preds == 1))
    diff = abs(detected - ACTUAL_MULE_COUNT)
    f1 = f1_score(y, preds)

    if diff < best_diff or (diff == best_diff and f1 > best_f1):
        best_diff = diff
        best_threshold = t
        best_f1 = f1

print(f"  Actual mule count: {ACTUAL_MULE_COUNT}")
print(f"  Optimal threshold: {best_threshold:.3f}")

final_preds = (all_probs >= best_threshold).astype(int)
detected = int(np.sum(final_preds == 1))
print(f"  Detections at optimal threshold: {detected}")

print("\n--- Full Dataset Performance ---")
print(classification_report(y, final_preds, target_names=["Legit", "Mule"]))
cm = confusion_matrix(y, final_preds)
print(f"  TN={cm[0][0]}  FP={cm[0][1]}")
print(f"  FN={cm[1][0]}  TP={cm[1][1]}")

print("\n--- Cross-Validation ---")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X_all_scaled, y, cv=cv, scoring='f1', n_jobs=-1)
print(f"  CV F1: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

print("\n" + "=" * 60)
print("Retraining on full dataset for production...")
print("=" * 60)

X_all_res, y_all_res = SMOTE(random_state=42).fit_resample(X_selected, y)
scaler_final = StandardScaler()
X_all_scaled_final = scaler_final.fit_transform(X_all_res)

model_final = XGBClassifier(
    n_estimators=500, max_depth=6, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8,
    min_child_weight=3, gamma=0.1, reg_alpha=0.1, reg_lambda=1.0,
    scale_pos_weight=spw, random_state=42, eval_metric="logloss",
    use_label_encoder=False, tree_method="hist", n_jobs=-1,
)
model_final.fit(X_all_scaled_final, y_all_res)

final_check_probs = model_final.predict_proba(scaler_final.transform(X_selected))[:, 1]
final_check_preds = (final_check_probs >= best_threshold).astype(int)
detected_final = int(np.sum(final_check_preds == 1))
print(f"\n  Final model detects: {detected_final} mule accounts (actual: {ACTUAL_MULE_COUNT})")

os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(model_final, os.path.join(MODEL_DIR, "fraud_model.pkl"))
joblib.dump(scaler_final, os.path.join(MODEL_DIR, "scaler.pkl"))
joblib.dump(selected_features, os.path.join(MODEL_DIR, "feature_columns.pkl"))
joblib.dump(label_encoders, os.path.join(MODEL_DIR, "label_encoders.pkl"))
joblib.dump(best_threshold, os.path.join(MODEL_DIR, "optimal_threshold.pkl"))
joblib.dump(imputation_values, os.path.join(MODEL_DIR, "imputation_values.pkl"))

print("\n" + "=" * 60)
print("Model saved:")
print(f"  fraud_model.pkl")
print(f"  scaler.pkl")
print(f"  feature_columns.pkl ({len(selected_features)} features)")
print(f"  label_encoders.pkl")
print(f"  optimal_threshold.pkl (threshold={best_threshold:.3f})")
print(f"  imputation_values.pkl ({len(imputation_values)} columns)")
print("=" * 60)
