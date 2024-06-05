import { hiddenCard, type Card } from "../helpers/card";
import { draw } from "./deck";
import { sendWS } from "./websocket";
import { sorCard } from '../data/sor';
import { v4 as uuidv4 } from 'uuid';

export type GameType = {
  gameId: string;
  p1: string;
  p2: string;
  decks: {
    p1: {
      fullDeck: Array<Card>,
      playDeck: Array<Card>,
    },
    p2: {
      fullDeck: Array<Card>,
      playDeck: Array<Card>,
    },
  };
  discards: {
    p1: {
      cards: Array<Card>,
    },
    p2: {
      cards: Array<Card>,
    },
  };
  hands: {
    p1: {
      cards: Array<Card>,
    },
    p2: {
      cards: Array<Card>,
    },
  };
  resources: {
    p1: {
      cards: Array<Card>,
    },
    p2: {
      cards: Array<Card>,
    },
  };
  grounds: {
    p1: {
      cards: Array<Card>,
    },
    p2: {
      cards: Array<Card>,
    },
  };
  spaces: {
    p1: {
      cards: Array<Card>,
    },
    p2: {
      cards: Array<Card>,
    },
  };
  leaders: {
    p1: Card|null,
    p2: Card|null,
  };
  bases: {
    p1: Card|null,
    p2: Card|null,
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

  const handsP1 = {p1: game.hands.p1?.cards, p2: game.hands.p2?.cards.map((card): Card => hiddenCard(card.id, card.owner, card.type, card.exhaust))};
  const handsP2 = {p2: game.hands.p2?.cards, p1: game.hands.p1?.cards.map((card): Card => hiddenCard(card.id, card.owner, card.type, card.exhaust))};
  const resourcesP1 = {p1: game.resources.p1?.cards, p2: game.resources.p2?.cards.map((card): Card => hiddenCard(card.id, card.owner, card.type, card.exhaust))};
  const resourcesP2 = {p2: game.resources.p2?.cards, p1: game.resources.p1?.cards.map((card): Card => hiddenCard(card.id, card.owner, card.type, card.exhaust))};

  const dataP1 = {step: 'initGame', decksCount, handsCount, hands: handsP1, resources: resourcesP1, handP1: drawResultP1.hand, leaders, bases};
  const dataP2 = {step: 'initGame', decksCount, handsCount, hands: handsP2, resources: resourcesP2, handP2: drawResultP2.hand, leaders, bases};

  sendWS(game, dataP1, dataP2);
};

export const reconnect = (gameId: string, playerUuid: string) => {
  const game = getGame(gameId) as GameType;
  
  const decksCount =  {p1: game.decks.p1?.playDeck?.length ?? 0, p2: game.decks.p2?.playDeck?.length ?? 0};
  const handsCount =  {p1: game.hands.p1?.cards?.length ?? 0, p2: game.hands.p2?.cards?.length ?? 0};
  const leaders = {p1: game.leaders.p1, p2: game.leaders.p2};
  const bases = {p1: game.bases.p1, p2: game.bases.p2};
  const grounds = {p1: game.grounds.p1?.cards, p2: game.grounds.p2?.cards};
  const spaces = {p1: game.spaces.p1?.cards, p2: game.spaces.p2?.cards};
  const discards = {p1: game.discards.p1?.cards, p2: game.discards.p2?.cards};
  const resourcesCount = {p1: game.resources.p1?.cards.length, p2: game.resources.p2?.cards.length};

  if (game.p1 === playerUuid) {
    const dataP1 = {
      step: 'initGame',
      decksCount,
      handsCount, 
      hands: {p1: game.hands.p1?.cards, p2: game.hands.p2?.cards.map((card): Card => hiddenCard(card.id, card.owner, card.type, card.exhaust))},
      handP1: game.hands.p1?.cards ?? [],
      leaders,
      bases,
      resources: {p1: game.resources.p1?.cards, p2: game.resources.p2?.cards.map((card): Card => hiddenCard(card.id, card.owner, card.type, card.exhaust))},
      resourcesP1: game.resources.p1?.cards ?? [],
      resourcesCount,
      grounds,
      spaces,
      discards,
    };
    sendWS(game, dataP1, null);
  } else {
    const dataP2 = {
      step: 'initGame',
      decksCount,
      handsCount, 
      hands: {p2: game.hands.p2?.cards, p1: game.hands.p1?.cards.map((card): Card => hiddenCard(card.id, card.owner, card.type, card.exhaust))},
      handP2: game.hands.p2?.cards ?? [],
      leaders,
      bases,
      resources: {p2: game.resources.p2?.cards, p1: game.resources.p1?.cards.map((card): Card => hiddenCard(card.id, card.owner, card.type, card.exhaust))},
      resourcesP1: game.resources.p1?.cards ?? [],
      resourcesCount,
      grounds,
      spaces,
      discards,
    };

    sendWS(game, null, dataP2);
  }
};

export const prepareDeckCard = (id: string, owner: string, index = 0) => {
  let tempCard;
  const [set, number] = id.split('_');
  if (set === 'SOR') {
    tempCard = sorCard[parseInt(number) - 1];
  } else {
    tempCard = sorCard[parseInt(number) - 1];
  }
   
  let card = {id: uuidv4(), owner, side: owner, ...tempCard} as Card;
  return card;
};

export type MoveCardType = {
  card: Card;
  side: string;
  area: string;
  fromArea: string;
  playerUuid: string;
}
export const moveCard = (gameId: string, moveData: MoveCardType) => {
  const game = getGame(gameId) as GameType;
  console.log(game, moveData)
  const {card, side, area, fromArea, playerUuid} = moveData;

  const fromSide = card.side === game.p1 ? 'p1': 'p2';
  const player = playerUuid === game.p1 ? 'p1': 'p2';
  const isFromPlayer = fromSide === player;
  const isToPlayer = side === player;
  console.log(fromArea, area, side, fromSide)
  if (fromArea === area && isFromPlayer === isToPlayer) return;

  switch (fromArea) {
      case 'hand': {
          const from = game.hands[fromSide].cards as Array<Card>;
          const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
          game.hands[fromSide].cards = newFrom;
          break;
      }
      case 'resources': {
          const from = game.resources[fromSide].cards as Array<Card>;
          const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
          game.resources[fromSide].cards = newFrom;
          break;
      }
      case 'deck': {
        const from = game.decks[fromSide].playDeck as Array<Card>;
        const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
        game.decks[fromSide].playDeck = newFrom;
        break;
      }
      case 'discard': {
          const from = game.discards[fromSide].cards as Array<Card>;
          const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
          game.discards[fromSide].cards = newFrom;
          break;
      }
      case 'ground': {
        const from = game.grounds[fromSide].cards as Array<Card>;
        const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
        game.grounds[fromSide].cards = newFrom;
        break;
      }
      case 'space': {
        const from = game.spaces[fromSide].cards as Array<Card>;
        const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
        game.spaces[fromSide].cards = newFrom;
        break;
      }
      case 'leader': {
          break;
      }
  }

  switch (area) {
      case 'hand': {
        const from = game.hands[fromSide].cards as Array<Card>;
        game.hands[fromSide].cards = [...from, card];
        break;
      }
      case 'resources': {
        const from = game.resources[fromSide].cards as Array<Card>;
        game.resources[fromSide].cards = [...from, card];
        break;
      }
      case 'deck': {
        const from = game.decks[fromSide].playDeck as Array<Card>;
        game.decks[fromSide].playDeck = [...from, card];
        break;
      }
      case 'discard': {
        const from = game.discards[fromSide].cards as Array<Card>;
        game.discards[fromSide].cards = [...from, card];
        break;
      }
      case 'ground': {
        const from = game.grounds[fromSide].cards as Array<Card>;
        game.grounds[fromSide].cards = [...from, card];
        break;
      }
      case 'space': {
        const from = game.spaces[fromSide].cards as Array<Card>;
        game.spaces[fromSide].cards = [...from, card];
        break;
      }
      case 'leader': {
        break;
      }
  }

  // sendWS(game, )
};

/*
const cardPushNewPosition = (card: Card, side: string, area: string, fromArea: string): void => {
  const fromSide = card.side === myuuid ? 'player': 'opponent';
  const isFromPlayer = fromSide === 'player';
  const isToPlayer = side === 'player';
  console.log(fromArea, area, side, fromSide)
  // TODO bug duplicate because Card.side is not updated 
  // TODO bug ground opponent to ground player
  if (fromArea === area && side === fromSide) return;

  switch (fromArea) {
      case 'hand': {
          const from = isFromPlayer ? handCards() : opponentHandCards();
          const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
          isFromPlayer ? setHandCards(newFrom) : setOpponentHandCards(newFrom);
          break;
      }
      case 'resources': {
          const from = isFromPlayer ? resourcesCards(): opponentResourcesCount();
          isFromPlayer
              ? setResourcesCards( (from as Array<Card>).filter((cardFrom) => cardFrom.id !== card.id) ) 
              : setOpponentResourcesCount(from as number + 1); 
          break;
      }
      case 'deck': {
          const from = isToPlayer ? deckCount() : opponentDeckCount();
          isToPlayer 
              ? setDeckCount(from - 1) 
              : setOpponentDeckCount(from - 1); 
          break;
      }
      case 'discard': {
          const from = isFromPlayer ? discardPileCards() : opponentDiscardPileCards();
          const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
          isFromPlayer ? setDiscardPileCards(newFrom) : setOpponentDiscardPileCards(newFrom);
          break;
      }
      case 'ground': {
          const from = isFromPlayer ? groundCards() : opponentGroundCards();
          const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
          isFromPlayer ? setGroundCards(newFrom) : setOpponentGroundCards(newFrom);
          break;
      }
      case 'space': {
          const from = isFromPlayer ? spaceCards() : opponentSpaceCards();
          const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
          isFromPlayer ? setSpaceCards(newFrom) : setOpponentSpaceCards(newFrom);
          break;
      }
      case 'leader': {
          break;
      }
  }

  switch (area) {
      case 'hand': {
          const from = isToPlayer? handCards() : opponentHandCards();
          // const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
          isToPlayer ? setHandCards([...from, card]) : setOpponentHandCards([...from, card]);
          break;
      }
      case 'resources': {
          const from = isToPlayer ? resourcesCards() : opponentResourcesCount();
          isToPlayer 
              ? setResourcesCards([...from as Array<Card>, card]) 
              : setOpponentResourcesCount(from as number + 1); 
          break;
      }
      case 'deck': {
          const from = isToPlayer ? deckCount() : opponentDeckCount();
          isToPlayer 
              ? setDeckCount(from + 1) 
              : setOpponentDeckCount(from + 1); 
          break;
      }
      case 'discard': {
          const from = isToPlayer ? discardPileCards() : opponentDiscardPileCards();
          isToPlayer ? setDiscardPileCards([...from, card]) : setOpponentDiscardPileCards([...from, card]);
          break;
      }
      case 'ground': {
          const from = isToPlayer ? groundCards() : opponentGroundCards();
          // const newFrom = from.filter((cardFrom) => cardFrom.id !== card.id)
          isToPlayer ? setGroundCards([...from, card]) : setOpponentGroundCards([...from, card]);
          break;
      }
      case 'space': {
          const from = isToPlayer ? spaceCards() : opponentSpaceCards();
          isToPlayer ? setSpaceCards([...from, card]) : setOpponentSpaceCards([...from, card]);
          break;
      }
      case 'leader': {
          break;
      }
  }
}
*/