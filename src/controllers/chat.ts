import EventEmitter from 'events';

export default class ChatController {
    private static instance: ChatController;
    private constructor() {}
  
    static getInstance(): ChatController {
      if (!ChatController.instance) {
        ChatController.instance = new ChatController();
      }
      return ChatController.instance;
    }

    private messages: string[] = [];

    public getMessages(): string[] {
        return this.messages;
    }
    private emitter = new EventEmitter();

    public subscribe(callback: (message: string) => void): void {
        this.emitter.on('message', callback);
    }

    public unsubscribe(callback: (message: string) => void): void {
        this.emitter.off('message', callback);
    }

    public addMessage(message: string): void {
        this.messages.push(message);
        this.emitter.emit('message', message);
    }
  }