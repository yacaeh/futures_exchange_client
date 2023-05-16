const wsurl = `wss://futures.kraken.com/ws/v1`
const crypto = require('crypto');

const getWebSocketSignature = (challange, secret) => {
    const secret_buffer = new Buffer(secret, 'base64');
    const hash          = new crypto.createHash('sha256');
    const hmac          = new crypto.createHmac('sha512', secret_buffer);
    const hash_digest   = hash.update(challange).digest('binary');
    const hmac_digest   = hmac.update(hash_digest, 'binary').digest('base64');

    return hmac_digest;
};

class WebSocketService {
    getChallange = async (secretKey) => {
        console.log("Get getChallange",);
        const ws = new WebSocket(wsurl);
        ws.onopen = () => {
            console.log("connected to " + wsurl);
            ws.send(
                JSON.stringify({
                    "event": "challenge",
                    "api_key": secretKey
                })
            );

        };
        ws.onclose = (error) => {
            console.log("disconnect from " + wsurl);
            console.log(error);
        };
        ws.onerror = (error) => {
            console.log("connection error " + wsurl);
            console.log(error);
        };
        ws.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            console.log("Data received");
            console.log(data);
            if (data.event == "challenge") {
                console.log("Challenge received");
                console.log(getWebSocketSignature(data.message, secretKey));
                return (data.message);
            }
        };
    }

    getBalance = async (secretKey, signature) => {
        console.log("Get wallet");
        const ws = new WebSocket(wsurl);
        ws.onopen = () => {
            console.log("connected to " + wsurl);
            ws.send(
                JSON.stringify({
                    "event": "subscribe",
                    "feed": "balances",
                    // "product_ids": ["PI_XBTUSD"]
                })
            );
        }
        ws.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            console.log("Data received");
            console.log(data);
            if (data.event == "challenge") {
                console.log("Challenge received");
                console.log(getWebSocketSignature(data.message, secretKey));
                return (data.message);
            }
        };
    }

}

export default new WebSocketService();