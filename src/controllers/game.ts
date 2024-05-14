import type { Card } from "./card";
import { draw } from "./deck";
import WebsocketController from "./websocket";

export type Game = {
  gameId: string;
  p1: string;
  p2: string;
  decks: {
    p1?: {
      fullDeck?: Array<string>,
      playDeck?: Array<string>,
    },
    p2?: {
      fullDeck?: Array<string>,
      playDeck?: Array<string>,
    },
  };
  hands: {
    p1?: {
      cards: Array<Card>,
    },
    p2?: {
      cards: Array<Card>,
    },
  };
  resources: {
    p1?: {
      cards: Array<Card>,
    },
    p2?: {
      cards: Array<Card>,
    },
  };
  grounds: {
    p1?: {
      cards: Array<Card>,
    },
    p2?: {
      cards: Array<Card>,
    },
  };
  space: {
    p1?: {
      cards: Array<Card>,
    },
    p2?: {
      cards: Array<Card>,
    },
  };
  leaders: {
    p1?: LeaderBaseDeck,
    p2?: LeaderBaseDeck,
  };
  bases: {
    p1?: LeaderBaseDeck,
    p2?: LeaderBaseDeck,
  }
};

export type LeaderBaseDeck = {
  id: string;
  exhaust: boolean,
  epicUsed?: boolean,
}

export default class GameController {
    private static instance: GameController;
    private constructor() {}

    // public controllers = new Set();
  
    static getInstance(): GameController {
      if (!GameController.instance) {
        GameController.instance = new GameController();
      }
      return GameController.instance;
    }

    private games: Map<string, {}> = new Map();

    public getGame(uuid: string): Game | null {
        return this.games.get(uuid) ?? null;
    }

    public setGame(uuid:string , game: Game): void {
        this.games.set(uuid, game);
        // const encoder = new TextEncoder();
        // const message = encoder.encode(`data: ${JSON.stringify(game)}\n\n`);

        // this.controllers.forEach((controller) => controller.enqueue(message));

        
    }
}

export const getGame = (gameId: string): Game | null => {
  return GameController.getInstance().getGame(gameId);
}

export const setGame = (game: Game): void => {
  console.log('setGame',game.gameId, game);
  GameController.getInstance().setGame(game.gameId, game);
  console.log('getGame', getGame(game.gameId));
}

export const startPhase = (gameId: string) => {
  const game = getGame(gameId) as Game;
  const drawResultP1 = draw(6, game.decks.p1.playDeck);
  const drawResultP2 = draw(6, game.decks.p2.playDeck);

  const updatedGame = {
    ...game, 
    decks: {
      p1: {
        ...game.decks.p1, 
        playDeck: drawResultP1.deck,
      },
      p2: {
        ...game.decks.p2, 
        playDeck: drawResultP2.deck,
      }
    },
    hands: {
      p1: {
        cards: [...game.hands.p1?.cards ?? [], ...drawResultP1.hand],
      },
      p2: {
        cards: [...game.hands.p2?.cards ?? [], ...drawResultP2.hand],
      },
    }
  }

  setGame(updatedGame);
  const decksCount =  {p1: drawResultP1.deck.length, p2: drawResultP2.deck.length};
  const handsCount =  {p1: 6, p2: 6};
  WebsocketController.connections.get(game.p1).send(JSON.stringify({step: 'startGame', decksCount, handsCount, handP1: drawResultP1.hand}));
  WebsocketController.connections.get(game.p2).send(JSON.stringify({step: 'startGame', decksCount, handsCount, handP2: drawResultP2.hand}));

}