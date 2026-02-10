const http = require('http');

function testEndpoint(path) {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Mock token or auth might be needed if middleware is active, 
            // but checking for 500 vs 401 is enough to differentiate crash vs auth error.
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`[${path}] Status: ${res.statusCode}`);
            console.log(`[${path}] Body: ${data.substring(0, 500)}`); // First 500 chars
        });
    });

    req.on('error', (e) => {
        console.error(`[${path}] Error: ${e.message}`);
    });

    req.end();
}

testEndpoint('/api/facilities/public');
// Mocking the specific call that fails
// Note: This might fail with 401 if auth is strictly enforced, but we want to see if it's 500 vs 401.
// If 500, it's the code/DB error. If 401, the endpoint is reachable and code is likely running (as auth middleware runs before controller).
const http2 = require('http');
function testIncomeStats() {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/billing/income-stats?period=monthly&facilityId=all',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // We can't easily mock a valid token here without login, so we expect 401 or 403, NOT 500.
        }
    };
    const req = http2.request(options, (res) => {
        console.log(`[/api/billing/income-stats] Status: ${res.statusCode}`);
        res.on('data', d => console.log(`[/api/billing/income-stats] Body: ${d}`));
    });
    req.on('error', e => console.error(`IncomeStats Error: ${e.message}`));
    req.end();
}
setTimeout(testIncomeStats, 2000); // Run after a delay

