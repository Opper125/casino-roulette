let casinoData = {
  users: {},
  requests: {},
  messages: [],
  game: { state: 'betting', timeLeft: 30, onlinePlayers: 0, result: null, adminStarted: false, history: [] },
  transactions: {}
};

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        body: JSON.stringify(casinoData),
      };
    } else if (event.httpMethod === 'POST') {
      const updates = JSON.parse(event.body);
      casinoData = { ...casinoData, ...updates };
      return {
        statusCode: 200,
        body: JSON.stringify(casinoData),
      };
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
