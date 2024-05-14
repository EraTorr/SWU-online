export type Card = {
    id: string;
    unique: boolean;
    aspects: Array<string>;
    traits: Array<string>;
    arenas: Array<string>;
    baseCost: number;
    modifiedCost?: number;
    basePower: number;
    modifiedPower?: number;
    baseHp: number;
    modifiedHp?: number;
    exhaust?: boolean
};