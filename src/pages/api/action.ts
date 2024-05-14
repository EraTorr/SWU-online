import type { APIRoute } from 'astro';
import WebsocketController from '../../controllers/websocket';

export const POST: APIRoute = async ({ request }) => {
    // const body = await request.json();

    console.log('r', request.body)
    // handleAction()
    return new Response(null, { status: 204 });
};