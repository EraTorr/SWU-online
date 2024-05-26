import type { Card } from "../helpers/card";

export const shuffleDeck = (deck: Array<Card>) => {
    const deckCopy = deck.slice(0);
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
    }
    return deckCopy;
}

export const draw = (amount: number, deck: Array<Card>) => {
    if (deck.length < amount) {
        // TODO implement life reducing system + mange
        return {hand: deck.slice(0, amount), deck: [], minusLife: deck.length - amount};
    }
    return {hand: deck.slice(0, amount), deck: deck.slice(amount), minusLife: 0};
}