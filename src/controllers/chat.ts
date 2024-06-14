export default class ChatController {
    private static instance: ChatController;
    private constructor() {}

    public controllers: Set<ReadableStreamDefaultController<any>> = new Set();
  
    static getInstance(): ChatController {
      if (!ChatController.instance) {
        ChatController.instance = new ChatController();
      }
      return ChatController.instance;
    }

    private history: string[] = [];

    public getMessages(): string[] {
        return this.history;
    }

    public addMessage(data: any): void {
        this.history.push(data);
        const encoder = new TextEncoder();
        const message = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

        this.controllers.forEach((controller) => controller.enqueue(message));
    }
  }