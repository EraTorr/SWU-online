import type { APIRoute } from 'astro';
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
    if (request.headers.get("Content-Type") === "application/json") {
        try {
            const { leader, base, deck } = await request.json();
            if (leader === undefined || base === undefined || deck === undefined){
                throw new Error('Missing leader, base or deck');
            }
            if (validateCardId(leader.id) 
                && validateCardId(base.id) 
                && validateDeck(deck)
            ) {
                return new Response('Success', { status: 200 });
            }
        } catch (e) {
            return new Response(e.message, { status: 400 });
        }
    }
    return new Response(null, { status: 404 });
};

const regexCardId = /^[a-zA-Z]{3}_[0-9]{3}$/;

const validateCardId = (id: string): boolean => {
    if (id === undefined) return false;
    if (!regexCardId.test(id)) return false;
    return true;
}

const validateDeck = (deck: Array<{id: string, count: number}>): boolean => {
    let totalCardCount = 0;
    const errorCards = deck.filter(card => {
        totalCardCount += card.count ?? 0;
        return !(validateCardId(card.id) && card.count !== undefined)
    });
    console.log(totalCardCount, errorCards, errorCards.length === 0 && totalCardCount >= 60);
    return errorCards.length === 0 && totalCardCount >= 60;
}