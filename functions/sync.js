const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { action, updates, token, repo, owner, path } = JSON.parse(event.body || '{}');
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN || token; // Use environment variable if available

    const headers = {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };

    // Get current data from GitHub
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const getResponse = await fetch(getUrl, { headers });
    const fileData = await getResponse.json();
    let currentData = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));

    switch (action) {
        case 'get':
            return { statusCode: 200, body: JSON.stringify(currentData) };
        case 'set':
            currentData = { ...currentData, ...updates };
            break;
        default:
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
    }

    // Update data on GitHub
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const content = Buffer.from(JSON.stringify(currentData, null, 2)).toString('base64');
    const putBody = {
        message: 'Update data.json',
        content,
        sha: fileData.sha
    };
    await fetch(putUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(putBody)
    });

    return { statusCode: 200, body: JSON.stringify(currentData) };
};
