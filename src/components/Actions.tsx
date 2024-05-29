import type { Component } from "solid-js";
import { mergeProps, createSignal, onMount, For } from "solid-js";
import {GameCard} from '../components/GameCard.tsx';
import "../style/actions.scss";

interface ActionsProps {
    cardType: string;
    sendEvent: (e: any) => void
}

export const Actions: Component<ActionsProps> = (props) => {

    let element!: HTMLDivElement;

    const [action, setAction] = createSignal<Array<Array<string>>>([]);

    onMount(() => {
        // TODO reload action list when parent remove list of action
        // How is it made with solidjs lifecycle
        actionList(props.cardType)
        document.addEventListener('click', (e: MouseEvent) => {
            console.log('open', action(), action().length);
            if (!!action().length && !(e.target as HTMLElement)?.closest('.action-list')) {
                props.sendEvent('close');
            }
        })
    })
    
    const actionList = (cardType: string): any => {
        const action = [];
        console.log(cardType)
        
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
        console.log('action', cardType, action)

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