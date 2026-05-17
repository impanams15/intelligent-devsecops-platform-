const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function debugProject() {
    console.log('🔍 Starting DevSecOps Platform Debugging Process...\n');

    // 1. Environment Variables Validation
    const envPath = path.join(__dirname, 'backend', '.env');
    if (fs.existsSync(envPath)) {
        console.log('✅ Found backend/.env');
        const envConfig = dotenv.parse(fs.readFileSync(envPath));

        const githubToken = envConfig.GITHUB_TOKEN;
        const githubRepo = envConfig.GITHUB_REPOSITORY;

        if (githubToken && githubToken.startsWith('github_pat_')) {
            console.log('✅ GITHUB_TOKEN format looks correct.');
        } else {
            console.warn('⚠️ GITHUB_TOKEN might be invalid or missing.');
        }

        if (githubRepo && githubRepo.includes('/')) {
            console.log(`✅ GITHUB_REPOSITORY set to: ${githubRepo.trim()}`);
        } else {
            console.warn('⚠️ GITHUB_REPOSITORY format incorrect (should be "user/repo").');
        }
    } else {
        console.error('❌ Backend .env file missing!');
    }

    // 2. API Health Check
    try {
        const health = await axios.get('http://localhost:5000/api/health');
        console.log('✅ Backend API Health Check: OK');
    } catch (err) {
        console.error('❌ Backend API Unreachable! Ensure Docker containers are running.');
    }

    // 3. AI Service Connectivity
    try {
        const aiHealth = await axios.post('http://localhost:8000/api/detect/cpu', { metrics: [50] });
        console.log('✅ AI Service Connectivity: OK');
    } catch (err) {
        console.warn('⚠️ AI Service not responding. Check AI_SERVICE_URL or container status.');
    }

    // 4. Prometheus Metrics Check
    try {
        const metrics = await axios.get('http://localhost:5000/metrics');
        if (metrics.data.includes('system_cpu_usage_percentage')) {
            console.log('✅ Metrics Exposure: OK (Found CPU usage metrics)');
        }
    } catch (err) {
        console.warn('⚠️ Prometheus metrics endpoint returning error.');
    }

    console.log('\n🚀 Debugging Complete.');
}

debugProject();
