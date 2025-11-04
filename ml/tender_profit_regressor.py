import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os





RANDOM_STATE = 42
TEST_SIZE = 0.2
MODEL_PATH = "./trainingDataset/tender_profit_model.pkl"





def load_dataset():
    #TODO: Complete the function definition
    return


def preprocess_data(df):
    features = ["bid_amount", "base_price", "quality_score", "company_experience", "past_success_rate"]
    target = "profit"

    X = df[features]
    y = df[target]


    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler






def train_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE)

    model = XGBRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth = 5,
        subsample=0.8,
        colsample_bytree = 0.8,
        random_state=RANDOM_STATE,
        objective='reg:squarederror'
    )

    model.fit(X_train, y_train)


    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("\n===========================Evaluation===========================")
    print(f"Mean Absolute Error (MAE): {mae:.3f}")
    print(f"Root Mean Squared Error (RMSE): {rmse:.3f}")
    print(f"R² Score: {r2:.3f}")

    return model



def save_model(model, scaler):
    joblib.dump({'model': model, 'scaler': scaler}, MODEL_PATH)
    print(f'\nModel saved to {MODEL_PATH}')






def predict_profit(model_data, new_data):
    model= model_data['model']
    scaler = model_data['scaler']

    df = pd.DataFrame([new_data])
    X_scaled = scaler.transform(df)
    profit = model.predict(X_scaled)[0]


    return profit





if __name__ == "__main__":
    df = load_dataset()
    X, y, scaler = preprocess_data(df)
    model = train_model(X, y)
    save_model(model, scaler)


    #TODO: test for prediction

