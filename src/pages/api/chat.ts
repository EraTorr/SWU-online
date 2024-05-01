import type { APIRoute } from 'astro';
import ChatController from '../../controllers/chat';
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
    if (request.headers.get("Content-Type") === "application/json") {
        try {
            const { message } = await request.json();
            ChatController.getInstance().addMessage(message);
        } catch (e) {
            console.log(e);
            return new Response(null, { status: 400 });
        }
        console.log(ChatController.getInstance().getMessages());
        return new Response(null, { status: 204 });
    }
    return new Response(null, { status: 404 });
};