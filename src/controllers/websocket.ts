import { WebSocket, WebSocketServer } from 'ws';
import { getGame, reconnect, setGame, startPhase, type Game } from './game';
import { shuffleDeck } from './deck';

export default class WebsocketController {
    private static server: WebSocketServer;
    public static connections: Map<string, any> = new Map();

    static getInstance(): WebSocketServer {
        if (!WebsocketController.server) {
            try {
                WebsocketController.server = new WebSocketServer({ port: 8080 });
            } catch (e) {
                console.log(e);
            }

            WebsocketController.server.on('connection', function connection(ws) {
                ws.on('error', console.error);
            
                ws.on('message', async function message(data) {
                    const message = await JSON.parse(data.toString());
                    if (message.action && message.data) {
                        handleAction(message.action, message.data, ws)
                    }

                });
            
                ws.send(JSON.stringify({response:'Connected'}));
            });
        }
        return WebsocketController.server;
    }
}

export const handleAction = async (action, data, ws: null) => {
    console.log(action)

    let game: Game|null = null;

    switch (action) {
        case 'acknowledge':
            WebsocketController.connections.set(data.uuid, ws);
            game = getGame(data.gameId);
            if (!game) break;

            const allConnected = [...WebsocketController.connections.keys()].filter(uuid => [game.p1, game.p2].includes(uuid)).length === 2;
            if (game.decks.p1 && game.decks.p2) {
                console.log('reconnect', data.uuid)
                if (game.p1 === data.uuid) {
                    const dataP1 = {action: 'reconnect'};
                    sendWS(game, dataP1, null)
                } else {
                    const dataP2 = {action: 'reconnect'};
                    sendWS(game, null, dataP2)
                }
                break;
            } 
            if (allConnected) {
                const dataP1 = {action: 'sendDeck'};
                const dataP2 = {action: 'sendDeck'};
                sendWS(game, dataP1, dataP2)
            }
            break;
        case 'sendDeck':
            game = getGame(data.gameId);

            if (!game) break;

            const deck = data.deck;
            const deckCard: Array<string> = [];

            deck.deck.forEach(card => {
                for (let i = 0; i < card.count; i++) {
                    deckCard.push(card.id)
                }
            });

            let updatedGame = structuredClone(game);
            if (game.p1 === data.uuid) {
                updatedGame = {
                    ...game,
                    decks: {
                        ...game.decks, 
                        p1: {
                            ...game.leaders.p1, 
                            fullDeck: deckCard,
                            playDeck: shuffleDeck(deckCard),
                        }
                    },
                    leaders: {
                        ...game.leaders,
                        p1: {
                            id: deck.leader.id,
                            exhaust: false,
                            epicUsed: false,
                        }
                    },
                    bases: {
                        ...game.leaders,
                        p1: {
                            id: deck.base.id,
                            exhaust: false,
                            epicUsed: false,
                        }
                    }
                };
            } else {
                updatedGame = {
                    ...game,
                    decks: {
                        ...game.decks,
                        p2: {
                            ...game.leaders.p2,
                            fullDeck: deckCard,
                            playDeck: shuffleDeck(deckCard),
                        }
                    },
                    leaders: {
                        ...game.leaders,
                        p2: {
                            id: deck.leader.id,
                            exhaust: false,
                            epicUsed: false,
                        }
                    },
                    bases: {
                        ...game.bases,
                        p2: {
                            id: deck.base.id,
                            exhaust: false,
                            epicUsed: false,
                        }
                    }
                };
            }

            setGame(updatedGame);
            
            if (updatedGame.decks.p1 && updatedGame.decks.p2) {
                startPhase(updatedGame.gameId);
            }
            break;
        case 'reconnect':
            reconnect(data.gameId, data.uuid)
            break;
    }
}

export const sendWS = (game, dataP1, dataP2) => {
    let responseP1 = null;
    let responseP2 = null;
    if (dataP1) responseP1 = JSON.stringify({uuids: [game.p1], data: dataP1});
    if (dataP2) responseP2 = JSON.stringify({uuids: [game.p2], data: dataP2});
    const socket = new WebSocket("ws://localhost:8080/");
    socket.addEventListener("open", () => {
      if (responseP1) socket.send(responseP1);
      if (responseP2) socket.send(responseP2);
      socket.close();
    });
}