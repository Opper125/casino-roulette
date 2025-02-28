const fetch = require('node-fetch');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Opper125/casino-roulette';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/contents/game.json`;

async function fetchGameData() {
    const response = await fetch(GITHUB_API, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    if (response.ok) {
        const data = await response.json();
        return JSON.parse(Buffer.from(data.content, 'base64').toString());
    }
    return { bets: {} };
}

async function updateGameData(data) {
    const existing = await fetchGameData();
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    await fetch(GITHUB_API, {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'Update bets',
            content,
            sha: existing ? existing.sha : undefined
        })
    });
}

exports.handler = async (event) => {
    const { userId, areaId, amount } = JSON.parse(event.body);
    const gameData = await fetchGameData();
    gameData.bets = gameData.bets || {};
    gameData.bets[areaId] = gameData.bets[areaId] || { players: 0, total: 0 };
    gameData.bets[areaId].players += 1;
    gameData.bets[areaId].total += amount;
    await updateGameData(gameData);
    return {
        statusCode: 200,
        body: JSON.stringify(gameData.bets)
    };
};
