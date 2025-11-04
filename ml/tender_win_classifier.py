import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, roc_auc_score, confusion_matrix, classification_report
import joblib
import os



RANDOM_STATE = 42
TEST_SIZE = 0.2
MODEL_PATH = "./trainingDataset/tender_win_model.pkl"


def load_dataset():
    #TODO Complete this function
    return




def preprocess_data(df):
    features = ["bid_amount", "base_price", "quality_score", "company_experience", "past_success_rate"]
    X = df[features]
    y = df['won']


    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)


    return X_scaled, y, scaler



def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE)


    model = XGBClassifier(
        n_estimators = 150,
        learning_rate = 0.1,
        max_depth = 4,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state = RANDOM_STATE,
        use_label_encoder = False,
        eval_metric = 'logloss'
    )

    model.fit(X_train, y_train)


    y_pred = model.predict(X_test)
    y_pred_prob = model.predict_proba(X_test)[:, 1]


    acc = accuracy_score(y_test, y_pred)
    roc = roc_auc_score(y_test, y_pred_prob)
    cm = confusion_matrix(y_test, y_pred)


    print("\n===========================Evaluation===========================")
    print(f"Accuracy: {acc:.3f}")
    print(f"ROC-AUC: {roc:.3f}")
    print("Confustion Matrix:\n", cm)
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    return model





def save_model(model, scaler):
    joblib.dump({'model':model, 'scaler':scaler}, MODEL_PATH)
    print(f"\nModel saved to {MODEL_PATH}")



def predict_new_bid(model_data, new_data):
    model = model_data['model']
    scaler = model_data['scaler']

    df = pd.DataFrame([new_data])
    X_scaled = scaler.transform(df)
    prob = model.predict_proba(X_scaled)[0][1]

    return prob



if __name__ == "__main__":
    df = load_dataset()

    X, y, scaler = preprocess_data(df)
    model = train_model(X, y)
    save_model(model, scaler)

    #TODO: Test on a new prediction later
