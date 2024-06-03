import { Show, type Component } from "solid-js";
import "../style/opponent-hidden-card.scss";
import { type Card } from "../helpers/card";
import { GameCard } from "./GameCard";

interface OpponentHiddenCardProps {
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
  pushNewPostion: (card: Card, side: string, area: string, fromArea: string) => void;
  area: string;
  count?: number;
}

export const OpponentHiddenCard: Component<OpponentHiddenCardProps> = (props) => {
    
    return (
    <div class="c-opponentHiddenCard">
      <GameCard
          name={props.name}
          cardData={props.cardData}
          pathFront="card_back"
          initPositionX={props.initPositionX}
          initPositionY={props.initPositionY}
          openActions={props.openActions}
          area={props.area}
          pushNewPostion={props.pushNewPostion}
      ></GameCard>
      <Show when={props.count}>
        <span classList={{exhausted: !!props.cardData.exhaust}}>{props.count}</span>
      </Show>
    </div>)
}
