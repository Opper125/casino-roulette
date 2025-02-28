const fetch = require('node-fetch');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Opper125/casino-roulette';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/contents/requests.json`;

async function fetchRequests() {
    const response = await fetch(GITHUB_API, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    if (response.ok) {
        const data = await response.json();
        return JSON.parse(Buffer.from(data.content, 'base64').toString());
    }
    return {};
}

async function updateRequests(data) {
    const existing = await fetchRequests();
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    await fetch(GITHUB_API, {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'Update requests',
            content,
            sha: existing ? existing.sha : undefined
        })
    });
}

exports.handler = async (event) => {
    const { userId, amount, method, phone } = JSON.parse(event.body);
    const requestId = `${userId}_${Date.now()}`;
    const requests = await fetchRequests();
    requests[requestId] = { userId, amount, method, phone, type: 'withdraw', status: 'pending', timestamp: Date.now() };
    await updateRequests(requests);
    return {
        statusCode: 200,
        body: JSON.stringify({ requestId })
    };
};
