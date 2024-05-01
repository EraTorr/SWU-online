import type { APIRoute } from 'astro';
import ChatController from '../../controllers/chat';

export const GET: APIRoute = async ({ request }) => {
  const body = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Subscribe to new messages
      ChatController.getInstance().subscribe(sendEvent);

      request.signal.addEventListener('abort', () => {
        // Unsubscribe from new messages
        ChatController.getInstance().unsubscribe(sendEvent);
        controller.close();
      });
    }
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
};