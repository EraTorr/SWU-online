import type { Component } from "solid-js";
import { mergeProps, createSignal, onMount, For } from "solid-js";
import {GameCard} from '../components/GameCard.tsx';

interface ActionsProps {
    cardType: string;
    sendEvent: (e: any) => void
}

export const Actions: Component<ActionsProps> = (props) => {

    
    // const clickOutsideHandle = () => {
    //     if (showActionListAlpine()) {
    //         toggleActionList();
    //     }
    // };
    
    const actionList = (cardType: string): any => {
        const action = [];

        if (cardType) {
            action.push(
                ['flip', 'Flip'],
                ['follow', 'Follow'],
                ['moveToSpace', 'Move to space'],
                ['moveToGround', 'Move to ground'],
                ['moveToDiscard', 'Move to discard'],
                ['moveToHand', 'Move to hand'],
                ['moveToRessource', 'Move to ressource'],
            );
        }

        return action;
    }

    return (
        <div class="action-list">
          <ul class="action-list">
            <For each={actionList(props.cardType)}>{(action) =>
              <li onClick={() => props.sendEvent(action[0])}>
                  {action[1]}
              </li>
            }</For>
          </ul>
        </div>
    )
}