import type { Component } from "solid-js";
import "../style/game-card.scss";
import { type Card } from "../helpers/card";
import { GameCard } from "./GameCard";

interface OpponentHandCardProps {
  name: string;
  cardData: Card,
  pathFront: string;
  pathBack?: string;
  initPositionX?: number;
  initPositionY?: number;
  showActionList?: boolean;
  owner?: number;
  playerView?: number;
  openActions: (data: any) => void;
}

export const OpponentHandCard: Component<OpponentHandCardProps> = (props) => {
    
    return (<GameCard
        name={props.name}
        cardData={props.cardData}
        pathFront="card_back"
        initPositionX={props.initPositionX}
        initPositionY={props.initPositionY}
        openActions={props.openActions}
    ></GameCard>)
    
}
