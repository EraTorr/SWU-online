import type { APIRoute } from 'astro';
import { handleAction } from '../../controllers/websocket';
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    if (request.headers.get("Content-Type") === "application/json") {
        const body = await request.json();
        
        handleAction(body.action, body.data, null);
    }

    return new Response(null, { status: 204 });
};
