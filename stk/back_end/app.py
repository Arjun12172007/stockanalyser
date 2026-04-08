from flask import Flask, request, jsonify
from flask_cors import CORS
from model import StockPredictor
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

@app.route('/api/predict', methods=['GET'])
def predict():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker is required"}), 400
        
    app.logger.info(f"Received prediction request for {ticker}")
    
    try:
        predictor = StockPredictor(ticker)
        
        # We need the data to get history
        data_df = predictor.fetch_data()
        
        result = predictor.train_and_predict()

        # Also get recent prices for graphing
        historical_close = data_df["Close"][-30:].tolist()
        historical_dates = data_df.index[-30:].strftime('%Y-%m-%d').tolist()

        return jsonify({
            "ticker": result["ticker"],
            "precision": result["precision"],
            "prediction": result["prediction_for_tomorrow"],
            "history_prices": historical_close,
            "history_dates": historical_dates
        })
    except Exception as e:
        app.logger.error(f"Error making prediction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/quote', methods=['GET'])
def get_quote():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker is required"}), 400
        
    try:
        import yfinance as yf
        import numpy as np # we might need to handle nan/inf for json
        import math
        stock = yf.Ticker(ticker)
        # Attempt to get fast info
        info = stock.info
        
        # If info is empty (sometimes happens with yfinance blocks), fallback to history
        price = info.get('currentPrice') or info.get('regularMarketPrice')
        if not price or math.isnan(price):
            hist = stock.history(period="1mo")
            if hist.empty:
                return jsonify({"error": "No data found for symbol"}), 404
            latest = hist.iloc[-1]
            prev = hist.iloc[-2] if len(hist) > 1 else latest
            
            price = latest['Close']
            prev_close = prev['Close']
            
            data = {
                "price": price,
                "change": price - prev_close,
                "changePercent": ((price - prev_close) / prev_close) * 100 if prev_close else 0,
                "high": latest['High'],
                "low": latest['Low'],
                "volume": int(latest['Volume']),
                "previousClose": prev_close,
                "longName": ticker,
                "fiftyTwoWeekHigh": hist['High'].max(),
                "fiftyTwoWeekLow": hist['Low'].min()
            }
        else:
            prev_close = info.get('previousClose', price)
            data = {
                "price": price,
                "change": price - prev_close,
                "changePercent": ((price - prev_close) / prev_close) * 100 if prev_close else 0,
                "high": info.get('dayHigh', price),
                "low": info.get('dayLow', price),
                "volume": info.get('volume', 0),
                "previousClose": prev_close,
                "longName": info.get('longName') or info.get('shortName') or ticker,
                "fiftyTwoWeekHigh": info.get('fiftyTwoWeekHigh', price),
                "fiftyTwoWeekLow": info.get('fiftyTwoWeekLow', price),
                "trailingPE": info.get('trailingPE', None),
                "marketCap": info.get('marketCap', None),
                "dividendYield": info.get('dividendYield', None),
                "epsTrailingTwelveMonths": info.get('trailingEps', None),
                "exchange": info.get('exchange', 'NSE')
            }
            
        return jsonify(data)
    except Exception as e:
        app.logger.error(f"Error fetching quote: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)

