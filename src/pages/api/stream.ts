import type { APIRoute } from 'astro';
import ChatController from '../../controllers/chat';


export const GET: APIRoute = async ({ request }) => {
  let controller: ReadableStreamDefaultController<any>;
  const body = new ReadableStream({
    start(c) {
      controller = c;
      ChatController.getInstance().controllers.add(controller);
    },
    cancel() {
      ChatController.getInstance().controllers.delete(controller);
    },
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
};