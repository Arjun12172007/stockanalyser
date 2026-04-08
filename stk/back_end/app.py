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
        result = predictor.train_and_predict()
        return jsonify({
            "ticker": result["ticker"],
            "precision": result["precision"],
            "prediction": result["prediction_for_tomorrow"]
        })
    except Exception as e:
        app.logger.error(f"Error making prediction: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
