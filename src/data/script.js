#!/usr/bin/env node

import db from './sor' assert  { type: "json" };
console.log(db.data);

const d = db.data.map((cards) => {
    return {
        set: cards.Set,
        number: cards.Number,
        name: cards.Name,
        subtitle: cards.Subtitle,
        type: cards.Type,
        aspects: cards.Aspects,
        traits: cards.Traits,
        arenas: cards.Arenas,
        cost: cards.Cost,
        power: cards.Power,
        hp: cards.HP,
        frontText: cards.FrontText,
        backText: cards.BackText,
        epicAction: cards.EpicAction,
        rarity: cards.Rarity,
        unique: cards.Unique,
        keywords: cards.Keywords,
    };
})

import * as fs from 'fs';
fs.writeFile('./s.json', JSON.stringify(d), err => {
  if (err) {
    console.error(err);
  } else {
    // file written successfully
  }
});