import type { APIRoute } from 'astro';
import WebsocketController from '../../controllers/websocket';

export const GET: APIRoute = async ({ request }) => {
    await WebsocketController.getInstance();
    return new Response(null, { status: 204 });
};