const WebSocket = require('ws');

let wss;

exports.handler = async (event, context) => {
    if (!wss) {
        wss = new WebSocket.Server({ noServer: true });
        wss.on('connection', ws => {
            console.log('Client connected');
            ws.on('message', message => {
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            });
            ws.on('close', () => console.log('Client disconnected'));
        });
    }

    if (event.headers.upgrade === 'websocket') {
        // Placeholder; Netlify doesn't support WebSocket natively
        return { statusCode: 101 };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'WebSocket endpoint' }),
    };
};

// Note: For real-time WebSocket, use an external service like Pusher or deploy a separate server
