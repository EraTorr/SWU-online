import type { APIRoute } from 'astro';
import MatchMakingController from '../../controllers/matchmaking';
export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
  let controller: ReadableStreamDefaultController<any>;
  const body = new ReadableStream({
    start(c) {
      controller = c;
      MatchMakingController.getInstance().controllers.add(controller);
    },
    cancel() {
      MatchMakingController.getInstance().controllers.delete(controller);
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