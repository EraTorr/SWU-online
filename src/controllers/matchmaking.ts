import EventEmitter from 'events';
import { redis } from '../valkey/server';
import { v4 as uuidv4 } from 'uuid';
import { setGame } from './game';

export default class MatchMakingController {
    private static instance: MatchMakingController;
    private constructor() {}
  
    public controllers = new Set<ReadableStreamDefaultController>();

    static getInstance(): MatchMakingController {
      if (!MatchMakingController.instance) {
        MatchMakingController.instance = new MatchMakingController();
      }
      return MatchMakingController.instance;
    }

    // private gameState: {} = {
    //     p1: '',
    //     p2: '',
    //     gameId: '',
    //     decks: {},
    //     hands: {},
    //     resources: {},
    //     grounds: {},
    //     spaces: {},
    //     leaders: {},
    //     bases: {},
    // };

    public createGame = (uuidP1: string, uuidP2: string) => {
        const idStartingPlayer = Math.floor(Math.random() * 2);
        const player1 = [uuidP1, uuidP2][idStartingPlayer];
        const player2 = [uuidP1, uuidP2][1 - idStartingPlayer];
        const gameState =  {
            p1: player1,
            p2: player2,
            gameId: uuidv4(),
            decks: {},
            hands: {},
            resources: {},
            grounds: {},
            spaces: {},
            leaders: {},
            bases: {},
        };

        setGame(gameState);

        const encoder = new TextEncoder();
        const message = encoder.encode(`data: ${JSON.stringify(gameState)}\n\n`);

        this.controllers.forEach((controller: ReadableStreamDefaultController) => controller.enqueue(message));
        return gameState;
    }
}