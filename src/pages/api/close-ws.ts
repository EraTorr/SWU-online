import type { APIRoute } from 'astro';
import WebsocketController from '../../controllers/websocket';

export const GET: APIRoute = ({ request }) => {
    WebsocketController.getInstance().close();
    return new Response(null, { status: 204 });
};