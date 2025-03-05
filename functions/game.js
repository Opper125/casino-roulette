let gameState = {
    active: false,
    timeLeft: 30,
    result: null
};

exports.handler = async (event, context) => {
    if (event.httpMethod === 'POST') {
        const body = JSON.parse(event.body);
        gameState.active = body.active !== undefined ? body.active : gameState.active;
        gameState.timeLeft = body.timeLeft !== undefined ? body.timeLeft : gameState.timeLeft;
        gameState.result = body.result !== undefined ? body.result : gameState.result;
    }

    if (gameState.active) {
        gameState.timeLeft--;
        if (gameState.timeLeft <= 0) {
            gameState.timeLeft = 30;
            const result = gameState.result || Math.floor(Math.random() * 37);
            gameState.result = null;
            return {
                statusCode: 200,
                body: JSON.stringify({ active: gameState.active, timeLeft: gameState.timeLeft, result })
            };
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ active: gameState.active, timeLeft: gameState.timeLeft, result: gameState.result })
    };
};
