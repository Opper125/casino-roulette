const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'casino-data.json');

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = { users: {}, requests: {}, messages: [], game: { state: 'betting', timeLeft: 30, onlinePlayers: 0, result: null, adminStarted: false, history: [] }, transactions: {} };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data));
}

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === 'GET') {
      const data = readData();
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    } else if (event.httpMethod === 'POST') {
      const updates = JSON.parse(event.body);
      const data = readData();
      const newData = { ...data, ...updates };
      writeData(newData);
      return {
        statusCode: 200,
        body: JSON.stringify(newData),
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
