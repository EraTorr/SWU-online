import EventEmitter from 'events';
import { redis } from '../valkey/server';
import { v4 as uuidv4 } from 'uuid';

export default class MatchMakingController {
    private static instance: MatchMakingController;
    private constructor() {}
  
    static getInstance(): MatchMakingController {
      if (!MatchMakingController.instance) {
        MatchMakingController.instance = new MatchMakingController();
      }
      return MatchMakingController.instance;
    }

    private messages: string[] = [];

    public getMessages(): string[] {
        return this.messages;
    }
    private emitter = new EventEmitter();

    public async subscribe(callback: (message: string) => void) {
        this.emitter.on('start-game', callback);
    }

    public async unsubscribe(callback: (message: string) => void) {
        this.emitter.off('start-game', callback);
    }

    public createGame = (uuidP1: string, uuidP2: string) => {
        const idStartingPlayer = Math.floor(Math.random() * 2);
        const player1 = [uuidP1, uuidP2][idStartingPlayer];
        const player2 = [uuidP1, uuidP2][1 - idStartingPlayer];
        const game =  {
            p1: player1,
            p2: player2,
            matchId: uuidv4(),
            decks: {},
            hands: {},
            resources: {},
            grounds: {},
            space: {},
            leaders: {},
            bases: {},
        };

        this.emitter.emit('start-game', game);
        return game;
    }
}