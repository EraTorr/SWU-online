import type { Card } from "../helpers/card";
import { draw } from "./deck";
import { sendWS } from "./websocket";
import { sorCard } from '../data/sor';


export type GameType = {
  gameId: string;
  p1: string;
  p2: string;
  decks: {
    p1?: {
      fullDeck?: Array<Card>,
      playDeck?: Array<Card>,
    },
    p2?: {
      fullDeck?: Array<Card>,
      playDeck?: Array<Card>,
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
  spaces: {
    p1?: {
      cards: Array<Card>,
    },
    p2?: {
      cards: Array<Card>,
    },
  };
  leaders: {
    p1?: Card,
    p2?: Card,
  };
  bases: {
    p1?: Card,
    p2?: Card,
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

    private games: Map<string, GameType> = new Map();

    public getGame(uuid: string): GameType | null {
        return this.games.get(uuid) ?? null;
    }

    public setGame(uuid:string , game: GameType): void {
        this.games.set(uuid, game);
        // const encoder = new TextEncoder();
        // const message = encoder.encode(`data: ${JSON.stringify(game)}\n\n`);

        // this.controllers.forEach((controller) => controller.enqueue(message));

        
    }
}

export const getGame = (gameId: string): GameType | null => {
  return GameController.getInstance().getGame(gameId);
}

export const setGame = (game: GameType): void => {
  GameController.getInstance().setGame(game.gameId, game);
}

export const startPhase = (gameId: string) => {
  console.log(sorCard);
  const game = getGame(gameId) as GameType;
  const drawResultP1 = draw(6, game.decks.p1?.playDeck ?? []);
  const drawResultP2 = draw(6, game.decks.p2?.playDeck ?? []);

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
        cards: [
          ...(game.hands.p1?.cards ?? []),
          ...drawResultP1.hand
        ],
      },
      p2: {
        cards: [
          ...(game.hands.p2?.cards ?? []), 
          ...drawResultP2.hand
        ],
      },
    }
  }

  setGame(updatedGame);
  const decksCount =  {p1: drawResultP1.deck.length, p2: drawResultP2.deck.length};
  const handsCount =  {p1: 6, p2: 6};
  const leaders = {p1: game.leaders.p1, p2: game.leaders.p2};
  const bases = {p1: game.bases.p1, p2: game.bases.p2};

  const dataP1 = {step: 'initGame', decksCount, handsCount, handP1: drawResultP1.hand, leaders, bases};
  const dataP2 = {step: 'initGame', decksCount, handsCount, handP2: drawResultP2.hand, leaders, bases};

  sendWS(game, dataP1, dataP2);
}

export const reconnect = (gameId: string, playerUuid: string) => {
  const game = getGame(gameId) as GameType;
  
  console.log(game.p1, game.p2, playerUuid);  

  const decksCount =  {p1: game.decks.p1?.playDeck?.length ?? 0, p2: game.decks.p2?.playDeck?.length ?? 0};
  const handsCount =  {p1: game.hands.p1?.cards?.length ?? 0, p2: game.hands.p2?.cards?.length ?? 0};
  const leaders = {p1: game.leaders.p1, p2: game.leaders.p2};
  const bases = {p1: game.bases.p1, p2: game.bases.p2};
  const grounds = {p1: game.grounds.p1?.cards, p2: game.grounds.p2?.cards};
  const spaces = {p1: game.spaces.p1?.cards, p2: game.spaces.p2?.cards};
  const resourcesCount = {p1: game.resources.p1?.cards.length, p2: game.resources.p2?.cards.length};

  if (game.p1 === playerUuid) {
    const dataP1 = {
      uuid: playerUuid,
      step: 'initGame',
      decksCount,
      handsCount, 
      handP1: game.hands.p1?.cards ?? [],
      leaders,
      bases,
      resourcesP1: game.resources.p1?.cards ?? [],
      resourcesCount,
      grounds,
      spaces,

    };
    sendWS(game, dataP1, null);
  } else {
    const dataP2 = {
      uuid: playerUuid,
      step: 'initGame',
      decksCount,
      handsCount, 
      handP2: game.hands.p2?.cards ?? [],
      leaders,
      bases,
      resourcesP1: game.resources.p1?.cards ?? [],
      resourcesCount,
      grounds,
      spaces,
      
    };

    sendWS(game, null, dataP2);
  }
}

export const prepareDeckCard = (id: string, owner: string) => {
  let tempCard;
  const [set, number] = id.split('_');
  if (set === 'SOR') {
    tempCard = sorCard[parseInt(number) - 1];
  } else {
    tempCard = sorCard[parseInt(number) - 1];
  }
   
  let card = {id: id, owner, side: owner, ...tempCard} as Card;
  return card;
};