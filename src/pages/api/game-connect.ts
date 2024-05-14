import type { APIRoute } from 'astro';
import WebsocketController from '../../controllers/websocket';
import { getGame } from '../../controllers/game';
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  const player = body.uuid;
  const deck = await JSON.parse(body.deck);
  const game = await JSON.parse(body.game);

  console.log(player, deck)
  console.log(game);

  if (!getGame(game.gameId)) {
    return new Response(null, { status: 400 });
  }
  console.log(getGame(game.gameId));

  return new Response(null, { status: 204 });
};