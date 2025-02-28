const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json'); // Replace with your serviceAccountKey.json path

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://cacino-roulette-default-rtdb.firebaseio.com' // Replace with your Realtime Database URL
});

const db = admin.database();
const gameStateRef = db.ref('gameState');
const betsRef = db.ref('bets');
const onlinePlayersRef = db.ref('onlinePlayers');

// Game Loop
let timeLeft = 30;
let gameState = 'betting';

function gameLoop() {
    if (timeLeft > 0) {
        timeLeft--;
        gameStateRef.set({ state: gameState, timeLeft });
    } else {
        if (gameState === 'betting') {
            gameState = 'spinning';
            const finalAngle = Math.floor(Math.random() * 360);
            gameStateRef.set({ state: gameState, timeLeft: 8, finalAngle });
            setTimeout(() => {
                const result = checkBallPosition(finalAngle);
                gameState = 'result';
                gameStateRef.set({ state: gameState, timeLeft: 2, result });
                betsRef.remove(); // Clear bets after round
            }, 8000);
        } else if (gameState === 'result') {
            gameState = 'betting';
            timeLeft = 30;
            gameStateRef.set({ state: gameState, timeLeft });
        }
    }
}

function checkBallPosition(finalAngle) {
    const anglePerNumber = 360 / 36;
    const index = Math.floor(finalAngle / anglePerNumber);
    const number = (index % 36) + 1;
    const bonuses = generateBonuses();
    return {
        number,
        isRed: index % 2 === 1,
        isBlack: index % 2 === 0,
        isOdd: number % 2 === 1,
        isEven: number % 2 === 0,
        isLow: number <= 18,
        isHigh: number > 18,
        dozen: number <= 12 ? '1st12' : number <= 24 ? '2nd12' : '3rd12',
        column: index % 3 === 0 ? 'col1' : index % 3 === 1 ? 'col2' : 'col3',
        bonuses
    };
}

function generateBonuses() {
    const bonusCount = Math.floor(Math.random() * 3) + 1;
    const bonusNumbers = new Set();
    while (bonusNumbers.size < bonusCount) {
        bonusNumbers.add(Math.floor(Math.random() * 36) + 1);
    }
    const bonuses = {};
    bonusNumbers.forEach(num => {
        bonuses[num] = Math.floor(Math.random() * 451) + 50; // x50-x500
    });
    return bonuses;
}

setInterval(gameLoop, 1000);

// Clean up online players on disconnect
onlinePlayersRef.on('child_removed', (snapshot) => {
    onlinePlayersRef.once('value', (snap) => {
        const count = Object.keys(snap.val() || {}).length;
        onlinePlayersRef.set(count);
    });
});

console.log('Server running...');
