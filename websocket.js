import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 8080 });
const connections = new Map();

server.on('connection', async function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', async function message(data) {
        const message = await JSON.parse(data.toString());
        
        if (message.action === 'acknowledge') {
            const uuid = message.data.uuid;
            connections.set(uuid, ws);
            try {
                await fetch("http://localhost:4321/api/action", {
                    method: "POST",
                    body: JSON.stringify({data: {gameId: message.data.gameId, uuid}, action: 'acknowledge'}),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                console.log('fetch', message.action);
            } catch(e) {
                console.log(e);
            }
        } else if (message.action && message.data) {
            try {
                await fetch("http://localhost:4321/api/action", {
                    method: "POST",
                    body: JSON.stringify(message),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                console.log('fetch', message.action);
            } catch(e) {
                console.log(e);
            }
        } else if (message.uuids && message.data) {
            console.log('send', message.uuids);

            message.uuids.forEach(uuid => {
                connections.get(uuid).send(JSON.stringify(message.data));              
            });
        }
 
    });

    ws.send(JSON.stringify({response:'Connected'}));
});

