export type Card = {
    id: string;
    aspects?: Array<string>;
    traits?: Array<string>;
    arenas?: Array<string>;
    cost: number;
    modifiedCost?: number;
    power?: number;
    modifiedPower?: number;
    hp?: number;
    modifiedHp?: number;
    exhaust?: boolean;
    set: string;
    number: string;
    name: string;
    subtitle?: string;
    type: string;
    frontText: string;
    backText?: string;
    epicAction?: string;
    epicUsed?: boolean;
    rarity: string;
    unique: boolean;
    keywords?: Array<string>;
    owner?: string;
    side?: string;
};

export const opponentHiddenCard = (opponentUuid: string, type: string, exhaust = false): Card => {
    return {
        id: '0',
        cost: 0,
        set: 'no',
        number: '000',
        name: 'card_back',
        type,
        frontText: 'card_back',
        rarity: 'no',
        unique: false,
        owner: opponentUuid,
        side: opponentUuid,
        exhaust
    }
}