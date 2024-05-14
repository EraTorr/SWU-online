import { WebSocketServer } from 'ws';
import { getGame, setGame, startPhase } from './game';
import { shuffleDeck } from './deck';

export default class WebsocketController {
    private static server: WebSocketServer;
    public static connections: Map<string, any> = new Map();

    static getInstance(): WebSocketServer {
        if (!WebsocketController.server) {
            try {
                console.log(WebsocketController.server)
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
            
                ws.send('Connected');
            });
        }
        return WebsocketController.server;
    }
}

const handleAction = async (action, data, ws) => {
    console.log(action)

    switch (action) {
        case 'acknowledge':
            WebsocketController.connections.set(data.uuid, ws);
            break;
        case 'sendDeck':
            const game = getGame(data.gameId);

            if (!game) break;

            const deck = await JSON.parse(data.deck)
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
    }
}