import { mergeProps, type Component } from "solid-js";
import { stopEvent } from "../helpers/app.helper";
import "../style/deck.scss";
import type { Card } from "../helpers/card";

interface DiscardPileProps {
    count?: number;
    cardList?: Array<Card>
    openActions?: (data: any) => void;
}

export const DiscardPile: Component<DiscardPileProps> = (props) => {
    const merged = mergeProps(
        {
          count: 0,
          cardList: [] as Array<Card>,
          openActions: (e: any) => console.log(e),
        },
        props,
      );

    const clickHandle = (event: any) => {
        stopEvent(event);

        merged.openActions(merged.cardList.map(c => c.id));
      };

    return (
        <div onClick={clickHandle} class="swu-deck">
            <span>{merged.count}</span>
        </div>
    )
}