"""
─────────────────────────────────────────────────
AI Anomaly Detection Service
Detects unusual CPU spikes, failed logins, and suspicious traffic patterns
─────────────────────────────────────────────────
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from detector import AnomalyDetector
import logging
from datetime import datetime, timezone

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize the anomaly detector
detector = AnomalyDetector()


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Anomaly Detection',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'version': '1.0.0'
    })


@app.route('/api/analyze', methods=['POST'])
def analyze_logs():
    """
    Analyze logs for anomalies
    Expects JSON body with 'logs' array
    """
    try:
        data = request.get_json()
        
        if not data or 'logs' not in data:
            return jsonify({
                'success': False,
                'message': 'Please provide logs array in request body'
            }), 400

        results = detector.analyze_logs(data['logs'])
        
        return jsonify({
            'success': True,
            'data': results,
            'analyzedAt': datetime.now(timezone.utc).isoformat()
        })

    except Exception as e:
        logger.error(f"Error analyzing logs: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/api/detect/cpu', methods=['POST'])
def detect_cpu_anomaly():
    """
    Detect CPU usage anomalies
    Expects JSON body with 'metrics' array of CPU values
    """
    try:
        data = request.get_json()
        if not data:
            metrics = []
        else:
            metrics = data.get('metrics', [])
        
        results = detector.detect_cpu_anomalies(metrics)
        
        return jsonify({
            'success': True,
            'data': results
        })

    except Exception as e:
        logger.error(f"CPU detection error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/detect/login', methods=['POST'])
def detect_login_anomaly():
    """
    Detect suspicious login patterns
    Expects JSON body with 'loginAttempts' array
    """
    try:
        data = request.get_json()
        if not data:
            attempts = []
        else:
            attempts = data.get('loginAttempts', [])
        
        results = detector.detect_login_anomalies(attempts)
        
        return jsonify({
            'success': True,
            'data': results
        })

    except Exception as e:
        logger.error(f"Login detection error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/detect/traffic', methods=['POST'])
def detect_traffic_anomaly():
    """
    Detect suspicious traffic patterns
    Expects JSON body with 'trafficData' array
    """
    try:
        data = request.get_json()
        if not data:
            traffic = []
        else:
            traffic = data.get('trafficData', [])
        
        results = detector.detect_traffic_anomalies(traffic)
        
        return jsonify({
            'success': True,
            'data': results
        })

    except Exception as e:
        logger.error(f"Traffic detection error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/simulate', methods=['GET'])
def simulate_anomalies():
    """
    Generate simulated anomaly data for dashboard demonstration
    """
    try:
        simulated = detector.generate_simulated_data()
        
        return jsonify({
            'success': True,
            'data': simulated
        })

    except Exception as e:
        logger.error(f"Simulation error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500


if __name__ == '__main__':
    logger.info("🤖 Starting AI Anomaly Detection Service...")
    app.run(host='0.0.0.0', port=8000, debug=True)
