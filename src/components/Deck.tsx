import type { Component } from "solid-js";
import { stopEvent } from "../helpers/app.helper";
import "../style/deck.scss";

interface DeckProps {
    left: number;
    openActions: (data: any) => void;
}

export const Deck: Component<DeckProps> = (props) => {
    const clickHandle = (event: any) => {
        stopEvent(event);

        props.openActions({type: 'deck', card: 'deck'});
      };

    return (
        <div onClick={clickHandle} class="swu-deck">
            <span>{props.left}</span>
        </div>
    )
}