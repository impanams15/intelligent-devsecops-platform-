"""
─────────────────────────────────────────────────
Anomaly Detector Module
Implements statistical anomaly detection algorithms
for CPU spikes, failed logins, and suspicious traffic
─────────────────────────────────────────────────
"""

import numpy as np
from datetime import datetime, timedelta
import random
import logging

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """
    Anomaly detection engine using statistical methods.
    Uses Z-score and threshold-based detection for:
    - CPU usage spikes
    - Failed login attempts
    - Suspicious traffic patterns
    """

    def __init__(self, z_threshold=2.5, cpu_threshold=85, login_threshold=10):
        """
        Initialize the detector with configurable thresholds.
        
        Args:
            z_threshold: Z-score threshold for anomaly detection (default: 2.5)
            cpu_threshold: CPU usage percentage threshold (default: 85%)
            login_threshold: Max failed logins before alert (default: 10)
        """
        self.z_threshold = z_threshold
        self.cpu_threshold = cpu_threshold
        self.login_threshold = login_threshold
        logger.info(f"AnomalyDetector initialized | Z:{z_threshold} CPU:{cpu_threshold}% Login:{login_threshold}")

    def _calculate_z_scores(self, data):
        """
        Calculate Z-scores for a dataset.
        Z-score = (value - mean) / standard_deviation
        Values with |Z| > threshold are considered anomalies.
        """
        if len(data) < 2:
            return [0] * len(data)
        
        mean = np.mean(data)
        std = np.std(data)
        
        if std == 0:
            return [0] * len(data)
        
        return [(x - mean) / std for x in data]

    def analyze_logs(self, logs):
        """
        Analyze log entries for anomalies.
        
        Args:
            logs: List of log dictionaries with 'level', 'message', 'timestamp'
        
        Returns:
            Dictionary with anomaly analysis results
        """
        anomalies = []
        error_count = 0
        warning_count = 0
        
        # Suspicious patterns to look for in logs
        suspicious_patterns = [
            'failed login', 'unauthorized', 'permission denied',
            'sql injection', 'xss', 'brute force', 'buffer overflow',
            'root access', 'sudo', 'chmod 777', 'rm -rf',
            'suspicious', 'malware', 'exploit'
        ]

        for i, log in enumerate(logs):
            message = log.get('message', '').lower()
            level = log.get('level', 'info').lower()
            
            # Count error/warning levels
            if level == 'error':
                error_count += 1
            elif level == 'warning':
                warning_count += 1
            
            # Check for suspicious patterns
            for pattern in suspicious_patterns:
                if pattern in message:
                    anomalies.append({
                        'index': i,
                        'type': 'suspicious_pattern',
                        'pattern': pattern,
                        'message': log.get('message', ''),
                        'severity': 'high' if level == 'error' else 'medium',
                        'timestamp': log.get('timestamp', datetime.utcnow().isoformat())
                    })
                    break

        # Calculate error rate
        total = len(logs) if logs else 1
        error_rate = (error_count / total) * 100

        return {
            'totalLogs': len(logs),
            'errorCount': error_count,
            'warningCount': warning_count,
            'errorRate': round(error_rate, 2),
            'anomaliesDetected': len(anomalies),
            'anomalies': anomalies[:20],  # Limit results
            'riskLevel': 'critical' if error_rate > 30 else ('high' if error_rate > 15 else ('medium' if error_rate > 5 else 'low'))
        }

    def detect_cpu_anomalies(self, metrics):
        """
        Detect CPU usage anomalies using Z-score analysis.
        
        Args:
            metrics: List of CPU usage values (percentages)
        
        Returns:
            Dictionary with CPU anomaly results
        """
        if not metrics:
            metrics = self._generate_cpu_data()

        values = [m.get('value', m) if isinstance(m, dict) else m for m in metrics]
        z_scores = self._calculate_z_scores(values)
        
        anomalies = []
        for i, (value, z) in enumerate(zip(values, z_scores)):
            is_anomaly = abs(z) > self.z_threshold or value > self.cpu_threshold
            if is_anomaly:
                anomalies.append({
                    'index': i,
                    'value': round(value, 2),
                    'zScore': round(z, 3),
                    'severity': 'critical' if value > 95 else ('high' if value > self.cpu_threshold else 'medium'),
                    'timestamp': metrics[i].get('timestamp', '') if isinstance(metrics[i], dict) else ''
                })

        mean_val = np.mean(values).item() if values else 0
        std_val = np.std(values).item() if values else 0
        max_val = max(values) if values else 0
        min_val = min(values) if values else 0

        return {
            'totalDataPoints': len(metrics),
            'mean': round(float(mean_val), 2),
            'stdDev': round(float(std_val), 2),
            'maxValue': round(float(max_val), 2),
            'minValue': round(float(min_val), 2),
            'anomaliesDetected': len(anomalies),
            'anomalies': anomalies,
            'threshold': self.cpu_threshold,
            'status': 'alert' if len(anomalies) > 3 else ('warning' if anomalies else 'normal')
        }

    def detect_login_anomalies(self, attempts):
        """
        Detect suspicious login patterns.
        
        Args:
            attempts: List of login attempt dictionaries
        
        Returns:
            Dictionary with login anomaly results
        """
        if not attempts:
            attempts = self._generate_login_data()

        # Group by IP address
        ip_attempts = {}
        for attempt in attempts:
            ip = attempt.get('ip', 'unknown')
            if ip not in ip_attempts:
                ip_attempts[ip] = {'total': 0, 'failed': 0, 'timestamps': []}
            ip_attempts[ip]['total'] += 1
            if not attempt.get('success', True):
                ip_attempts[ip]['failed'] += 1
            ip_attempts[ip]['timestamps'].append(attempt.get('timestamp', ''))

        suspicious_ips = []
        for ip, data in ip_attempts.items():
            if data['failed'] >= self.login_threshold:
                suspicious_ips.append({
                    'ip': ip,
                    'totalAttempts': data['total'],
                    'failedAttempts': data['failed'],
                    'failureRate': round((data['failed'] / data['total']) * 100, 1),
                    'severity': 'critical' if data['failed'] > 50 else ('high' if data['failed'] > 20 else 'medium'),
                    'recommendation': 'Block IP immediately' if data['failed'] > 50 else 'Monitor closely'
                })

        total_failed = sum(1 for a in attempts if not a.get('success', True))
        
        return {
            'totalAttempts': len(attempts),
            'failedAttempts': total_failed,
            'uniqueIPs': len(ip_attempts),
            'suspiciousIPs': sorted(suspicious_ips, key=lambda x: x['failedAttempts'], reverse=True),
            'bruteForceDetected': any(ip['failedAttempts'] > 20 for ip in suspicious_ips),
            'riskLevel': 'critical' if any(ip['failedAttempts'] > 50 for ip in suspicious_ips) else ('high' if suspicious_ips else 'low')
        }

    def detect_traffic_anomalies(self, traffic_data):
        """
        Detect suspicious traffic patterns using statistical analysis.
        
        Args:
            traffic_data: List of traffic data points
        
        Returns:
            Dictionary with traffic anomaly results
        """
        if not traffic_data:
            traffic_data = self._generate_traffic_data()

        request_counts = [t.get('requests', t) if isinstance(t, dict) else t for t in traffic_data]
        z_scores = self._calculate_z_scores(request_counts)
        
        anomalies = []
        for i, (count, z) in enumerate(zip(request_counts, z_scores)):
            if abs(z) > self.z_threshold:
                anomalies.append({
                    'index': i,
                    'requests': count,
                    'zScore': round(z, 3),
                    'type': 'spike' if z > 0 else 'drop',
                    'severity': 'high' if abs(z) > 3 else 'medium',
                    'timestamp': traffic_data[i].get('timestamp', '') if isinstance(traffic_data[i], dict) else ''
                })

        avg_req = np.mean(request_counts).item() if request_counts else 0
        max_req = max(request_counts) if request_counts else 0

        return {
            'totalDataPoints': len(traffic_data),
            'avgRequests': round(float(avg_req), 2),
            'maxRequests': int(max_req),
            'anomaliesDetected': len(anomalies),
            'anomalies': anomalies,
            'ddosRisk': len(anomalies) > 5 and any(a['type'] == 'spike' for a in anomalies),
            'status': 'critical' if len(anomalies) > 5 else ('warning' if anomalies else 'normal')
        }

    def _generate_cpu_data(self):
        """Generate simulated CPU data with some anomalies"""
        data = []
        now = datetime.utcnow()
        for i in range(48):
            # Normal CPU range 20-60%, with occasional spikes
            value = random.gauss(40, 10)
            if random.random() < 0.08:  # 8% chance of anomaly
                value = random.uniform(85, 99)
            data.append({
                'value': max(0, min(100, value)),
                'timestamp': (now - timedelta(hours=48-i)).isoformat()
            })
        return data

    def _generate_login_data(self):
        """Generate simulated login attempt data"""
        attempts = []
        now = datetime.utcnow()
        normal_ips = [f'10.0.{random.randint(1,255)}.{random.randint(1,255)}' for _ in range(20)]
        suspicious_ip = '192.168.1.100'
        
        for i in range(200):
            if random.random() < 0.2:  # 20% from suspicious IP
                attempts.append({
                    'ip': suspicious_ip,
                    'success': random.random() < 0.05,  # 95% failure rate
                    'username': f'admin{random.randint(1,5)}',
                    'timestamp': (now - timedelta(minutes=random.randint(1, 1440))).isoformat()
                })
            else:
                attempts.append({
                    'ip': random.choice(normal_ips),
                    'success': random.random() < 0.9,
                    'username': f'user{random.randint(1,50)}',
                    'timestamp': (now - timedelta(minutes=random.randint(1, 1440))).isoformat()
                })
        return attempts

    def _generate_traffic_data(self):
        """Generate simulated traffic data with anomalies"""
        data = []
        now = datetime.utcnow()
        for i in range(72):
            # Normal traffic pattern
            requests = int(random.gauss(500, 100))
            if random.random() < 0.06:  # 6% chance of traffic spike
                requests = int(random.uniform(1500, 3000))
            data.append({
                'requests': max(0, requests),
                'timestamp': (now - timedelta(hours=72-i)).isoformat()
            })
        return data

    def generate_simulated_data(self):
        """
        Generate complete simulated anomaly data for dashboard demo.
        Returns all three types of anomaly analysis.
        """
        cpu_data = self._generate_cpu_data()
        login_data = self._generate_login_data()
        traffic_data = self._generate_traffic_data()

        return {
            'cpu': self.detect_cpu_anomalies(cpu_data),
            'login': self.detect_login_anomalies(login_data),
            'traffic': self.detect_traffic_anomalies(traffic_data),
            'overallRisk': 'high',
            'generatedAt': datetime.utcnow().isoformat()
        }
