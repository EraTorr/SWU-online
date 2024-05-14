import { WebSocketServer } from 'ws';



const server = new WebSocketServer({ port: 8080 });
const connections = new Map();


server.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', async function message(data) {
        const message = await JSON.parse(data.toString());
        if (message.action === 'acknowledge') {
            connections.set(data.uuid, ws);
        } else if (message.action && message.data) {
            console.log(message)
            fetch("http://127.0.0.1:4321/api/action", {
                method: "POST",
                body: JSON.stringify({test: 'teat'}),
                headers: {
                    "Content-Type": "application/json",
                },
            });
        } else if (message.uuids && message.data) {
            message.uuids.forEach(uuid => {
                connections.get(uuid).send(JSON.stringify(message.data));              
            });
        }
 
    });

    ws.send('Connected');
});

