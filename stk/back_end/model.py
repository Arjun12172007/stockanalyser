import yfinance as yf
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score

class StockPredictor:
    def __init__(self, ticker):
        self.ticker = ticker
        self.model = RandomForestClassifier(n_estimators=100, min_samples_split=100, random_state=1)

    def fetch_data(self):
        # Fetch 10 years of historical data
        stock = yf.Ticker(self.ticker)
        data = stock.history(period="max")
        
        # Create a "Target" column (1 if price goes up tomorrow, 0 if down)
        data["Tomorrow"] = data["Close"].shift(-1)
        data["Target"] = (data["Tomorrow"] > data["Close"]).astype(int)
        
        # Keep only relevant columns
        return data.loc["2010-01-01":].copy()

    def train_and_predict(self):
        data = self.fetch_data()
        predictors = ["Close", "Volume", "Open", "High", "Low"]
        
        # Split into train (all but last 100 days) and test (last 100 days)
        train = data.iloc[:-100]
        test = data.iloc[-100:]
        
        self.model.fit(train[predictors], train["Target"])
        
        # Generate predictions
        preds = self.model.predict(test[predictors])
        preds = pd.Series(preds, index=test.index, name="Predictions")
        
        # Calculate accuracy based on precision
        precision = precision_score(test["Target"], preds)
        
        # Predict for the actual NEXT trading day
        last_row = data.iloc[-1:][predictors]
        future_move = self.model.predict(last_row)
        
        return {
            "ticker": self.ticker,
            "precision": f"{precision * 100:.2f}%",
            "prediction_for_tomorrow": "UP" if future_move[0] == 1 else "DOWN"
        }

# Usage
if __name__ == "__main__":
    # You can change 'NVDA' to any stock like 'AAPL' or 'TSLA'
    analyzer = StockPredictor("NVDA")
    result = analyzer.train_and_predict()
    
    print(f"--- Analysis for {result['ticker']} ---")
    print(f"Model Precision: {result['precision']}")
    print(f"Prediction for next session: {result['prediction_for_tomorrow']}")  