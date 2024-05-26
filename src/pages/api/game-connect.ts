import type { APIRoute } from 'astro';
import { getGame } from '../../controllers/game';
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  if (!getGame(body.gameId)) {
    return new Response(null, { status: 400 });
  }

  return new Response(null, { status: 204 });
};