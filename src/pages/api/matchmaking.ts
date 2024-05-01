import type { APIRoute } from 'astro';
import MatchMakingController from '../../controllers/matchmaking';
import { redis } from '../../valkey/server';

export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
    const { uuid } = await request.json();
    (async () => {
        try {            
            const opponentFound = await getOpponent(uuid);

            if (opponentFound) {
                console.log('opponentFound', opponentFound);
                const game = MatchMakingController.getInstance().createGame(uuid, opponentFound);
                new Response(JSON.stringify(game), { status: 200 });
            }
            
            const randNumber = Math.floor(Math.random() * 5) + 1;
            const response = await redis.zadd(
                "matchmaking",
                { nx: true },
                { score: randNumber, member: uuid }
            );
            console.log('redis.zadd', response);
        } catch (error) {
          console.error(error);
        }
      })();

    return new Response(null, { status: 204 });
};

const getOpponent = async (uuidP1: string) => {
    const randNumber = Array.from(
        { length: 5 },
        () => Math.floor(Math.random() * (5 - 1 + 1)) + 1
    );
    let uuidP2: string | null = null;
    for(const number of randNumber) {
        const res: Array<string> = await redis.zrange("matchmaking", number - 1, number + 1);
        const filtered = res.filter(uuid => uuid !== uuidP1);
        if (filtered.length === 0) continue;
        const t = Math.floor(Math.random() * filtered.length);
        uuidP2 = filtered[t];
        await redis.zrem("matchmaking", uuidP2);

        break;
    }
    
    if (uuidP2) {
        return uuidP2;
    }
    return null;
}


export const DELETE: APIRoute = async ({ request }) => {
    const uuid = request.url.split('?').pop()?.split('&').filter(param => param.includes('uuid='))[0]?.split('=').pop();
    console.log('delete', uuid);
    if (uuid === undefined) {
        return new Response(null, { status: 404 });
    }
    await redis.zrem("matchmaking", uuid);
    return new Response(null, { status: 204 });
};