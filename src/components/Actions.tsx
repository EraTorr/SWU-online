import type { Component } from "solid-js";
import { mergeProps, createSignal, onMount, For, createEffect } from "solid-js";
import {GameCard} from '../components/GameCard.tsx';
import "../style/actions.scss";
import type { Card } from "../helpers/card.ts";

export interface ActionsData {
    type: string;
    area: string;
    card?: Card;
}

interface ActionsProps {
    data: ActionsData;
    sendEvent: (e: any) => void
}

export const Actions: Component<ActionsProps> = (props) => {

    let element!: HTMLDivElement;

    const [action, setAction] = createSignal<Array<Array<string>>>([]);

    createEffect((prevData) => {
        console.log('cEA', JSON.stringify(prevData) !== JSON.stringify(props.data));
        if (JSON.stringify(prevData) !== JSON.stringify(props.data)) {
            console.log("type changed to", props.data.area, )
            actionList('prevCardtype')
        }
        return props.data;
    })

    const clickMouseEvent = (e: MouseEvent) => {
        if (!!action().length && !(e.target as HTMLElement)?.closest('.action-list')) {
            props.sendEvent('close');
            document.removeEventListener('click', clickMouseEvent);
        }
    }
      
    onMount(() => {
        // TODO reload action list when parent remove list of action
        document.addEventListener('click', clickMouseEvent)
    })
    
    const actionList = (from: any): any => {
        const action = [];
        console.log('actionList', props.data.type, props.data.area, from)
        
        switch (props.data.type.toLowerCase()) {
            case 'leader':
                action.push(
                    ['action', 'Action'],
                    ['invoke', 'Invoke'],
                );
                break;
            case 'base':
                action.push(
                    ['epic', 'Epic action'],
                );
                break;
            case 'deck':
                action.push(
                    ['draw', 'Draw X'],
                    ['look', 'Look X'],
                    ['discard', 'Discard X'],
                    ['shuffle', 'Shuffle']
                );
                break;
            default:
                action.push(
                    ['flip', 'Flip'],
                    ['follow', 'Follow'],
                    ['moveToSpace', 'Move to space'],
                    ['moveToGround', 'Move to ground'],
                    ['moveToDiscard', 'Move to discard'],
                    ['moveToHand', 'Move to hand'],
                    ['moveToRessource', 'Move to ressource'],
                    ['move', 'Move'],
                    ['moveToDeckTop', 'Move to Deck top'],
                    ['moveToDeckBottom', 'Move to Deck bottom'],
                );
                break;
        }

        switch (props.data.area) {
            case 'discard':
                action.push(
                    ['look', 'Look'],
                );
                break;
            case 'hand':
                action.push(
                    ['play', 'Play'],
                );
                break;
            case 'space':
                action.push(
                    ['action', 'Action'],
                    ['attack', 'Attack'],
                );
                break;
            case 'ground':
                action.push(
                    ['action', 'Action'],
                    ['attack', 'Attack'],
                );
                break;
            case 'resource':
                action.push(
                    ['exhaust', 'Exhaust'],
                );
                break;
            default:
                action.push(
                    ['', 'Default area'],
                )
                break;
        }

        console.log('action', action)

        setAction(action);
    }

    return (
        <div ref={element} class="action-list" classList={{visible: !!action().length}}>
          {/* <ul class="action-list"> */}
          <ul>
            <For each={action()}>{(action) =>
              <li onClick={() => props.sendEvent(action[0])}>
                  {action[1]}
              </li>
            }</For>
          </ul>
        </div>
    )
}
