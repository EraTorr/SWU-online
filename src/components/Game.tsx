import type { Component } from "solid-js";
import { mergeProps, createSignal, onMount, Show, For } from "solid-js";
import {GameCard} from '../components/GameCard.tsx';

import "../style/game.scss";
import { newListener } from "../helpers/app.helper.ts";
import { Actions, type ActionsData } from "./Actions.tsx";
import { opponentHiddenCard, type Card } from "../helpers/card.ts";
import { Deck } from "./Deck.tsx";
import { OpponentHiddenCard } from "./OpponentHiddenCard.tsx";
import { DiscardPile } from "./DiscardPile.tsx";

export const Game: Component = (props) => {

    let element!: HTMLDivElement;
    let myuuid: string;
    let gameId: string;
    let opponentUuid: string;

    const [base, setBase] = createSignal<Card>();
    const [opponentBase, setOpponentBase] = createSignal<Card>();
    const [leader, setLeader] = createSignal<Card>();
    const [opponentLeader, setOpponentLeader] = createSignal<Card>();

    const [socket, setSocket] = createSignal<WebSocket|null>(null);
    const [actionsData, setActionsData] = createSignal<ActionsData|null>(null);
    // const [actionsArea, setActionsArea] = createSignal<string>('');
    // const [actionsCard, setActionsCard] = createSignal<string>('');
    const [cards, setCards] = createSignal<Array<Card>>([]);
    const [opponentHandCount, setOpponentHandCount] = createSignal<number>(0);
    const [opponentResourcesCount, setOpponentResourcesCount] = createSignal<number>(11);
    const [opponentExhaustedResourcesCount, setOpponentExhaustedResourcesCount] = createSignal<number>(1);
    const [handCards, setHandCards] = createSignal<Array<Card>>([]);
    const [deckCount, setDeckCount] = createSignal<number>(0);
    const [opponentDeckCount, setOpponentDeckCount] = createSignal<number>(0);
    const [discardPileCards, setDiscardPileCards] = createSignal<Array<Card>>([]);
    const [opponentDiscardPileCards, setOpponentDiscardPileCards] = createSignal<Array<Card>>([]);
    const [resourcesCards, setResourcesCards] = createSignal<Array<Card>>([]);

    onMount(async () => {
        const game = JSON.parse(sessionStorage.getItem('game') as string);
        myuuid = localStorage.getItem('myuuid') as string;
        gameId = game.gameId;
        opponentUuid = game.p1 === myuuid ? game.p2 : game.p1;
        

        const response = await fetch("/api/game-connect", {
            method: "POST",
            body: JSON.stringify({ gameId }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 400) {
            window.location.replace('pre-game');
        }

        // Create WebSocket connection.
        const socket = new WebSocket("ws://" + window.location.hostname + ":8080/");
        // Connection opened
        newListener(socket, "open", () => {
            socket.send(JSON.stringify({ action: 'acknowledge', data: { uuid: myuuid , gameId } }));
        });

        // Listen for messages
        newListener(socket, "message", async (event) => {
            const data = await JSON.parse(event.data)

            console.log('message', data);
            if (data.step) {
                executeStep(data);
            } else {
                if (data.action) {
                    if (data.action === 'sendDeck') {
                        // send deck
                        const deckParsed = JSON.parse(localStorage.getItem('deck') as string);
                        socket.send(JSON.stringify({ action: 'sendDeck', data: { gameId: gameId, uuid: myuuid, deck: deckParsed } }));
                    }
                    if (data.action === 'reconnect') {
                        // send deck
                        const deckParsed = JSON.parse(localStorage.getItem('deck') as string);
                        socket.send(JSON.stringify({ action: 'reconnect', data: { gameId: gameId, uuid: myuuid, deck: deckParsed } }));
                    }
                }
            }
        });	

        newListener(document, "sendMessage", (event: CustomEvent) => {
            const e = event as CustomEvent;
            console.log('sendMessage', e.detail)
            socket.send(JSON.stringify( e.detail ));
        });

        newListener(socket, "error", (event) => {
            console.log(event)
            window.location.replace('pre-game')
        });
            // window.onbeforeunload = () => {
            // 	fetch("/api/close-ws", {method: "GET"})
            // }
        
    })

    const openActions = (e: ActionsData) => {
        setActionsData(e);
    }

    const sendEvent = (e: any) => {
        const card = actionsData()?.card;
        setActionsData(null);
        console.log(card, e);
    }

    const executeStep = (data: any) => {
        const step = data.step;
        
        switch (step) {
            case 'initGame':
                setCards([
                    ...data.handP1 ?? [],
                    ...data.handP2 ?? [],
                ])
                
                if (myuuid === data.leaders.p1.owner) {
                    setLeader(data.leaders.p1);
                    setBase(data.bases.p1);
                    setDeckCount(data.decksCount.p1);

                    setOpponentLeader(data.leaders.p2);
                    setOpponentBase(data.bases.p2);
                    setOpponentDeckCount(data.decksCount.p2);
                    setOpponentHandCount(data.handsCount.p2);
                } else {
                    setLeader(data.leaders.p2);
                    setBase(data.bases.p2);
                    setDeckCount(data.decksCount.p2);

                    setOpponentLeader(data.leaders.p1);
                    setOpponentBase(data.bases.p1);
                    setOpponentDeckCount(data.decksCount.p1);
                    setOpponentHandCount(data.handsCount.p1);
                }
                
                console.log(data);
                if (data.handP1) {
                    setHandCards([...data.handP1]);
                } else {
                    setHandCards([...data.handP2]);
                }
                
                break;
            case '':
                break;
        }
    }

    // const moveTo = (target: string) => {
    //     console.log('test', target);
    //     let side = 'bottom';
    //     if (merged.playerView === 1) {
    //         side = merged.owner === 1 ? 'bottom': 'top';
    //     } else {
    //         side = merged.owner === 1 ? 'top': 'bottom';
    //     }
    //     const targetElement = document.querySelectorAll(`.${side} .${target}`)[0];
    //     const domRect = targetElement.getBoundingClientRect()
    //     setLeft(domRect.x);
    //     setTop(domRect.y);
    // }

    const calculateInitialPositionAbsolute = (card: Card, index: number = 0, area: string|null = null): {x: number, y: number} => {
        let side = 'top';
        if (card.side === myuuid) side = 'bottom';
        console.log('dsd', card.side, myuuid);
        if (area) {
            const el = element.querySelectorAll('.' + side + ' .' + area)[0]
            console.log('el.children.length', el.children.length);
            const b = el.getBoundingClientRect();
            return {x: b.left + b.width / 2 - 50, y: b.top + b.height / 2 - 71.8 / 2}
        }
        
        if (['Base', 'Leader'].includes(card.type)) {
            const type = card.type.toLowerCase();
            console.log(card, side, type)

            const b = element.querySelectorAll('.' + side + ' .' + type)[0].getBoundingClientRect();
            return {x: b.left + b.width / 2 - 50, y: b.top + b.height / 2 - 71.8 / 2}
        }
        return {x: 20 + index * 40, y: 20 + index * 40} 
    }

    const calculateInitialPositionRelative = (card: Card, index: number = 0, area: string|null = null): {x: number, y: number} => {
        let side = 'top';
        if (card.side === myuuid) side = 'bottom';
        console.log('dsd', card.side, myuuid);
        if (area) {
            const el = element.querySelectorAll('.' + side + ' .' + area)[0]
            console.log('el.children.length', el.children.length);
            const b = el.getBoundingClientRect();
            return {x: b.width / 2 - 50, y: b.height / 2 - 50}
        }
        
        if (['Base', 'Leader'].includes(card.type)) {
            const type = card.type.toLowerCase();
            console.log(card, side, type)

            const b = element.querySelectorAll('.' + side + ' .' + type)[0].getBoundingClientRect();
            return {x: b.width / 2 - 50, y: b.height / 2 - 71.8 / 2}
        }
        return {x: 20 + index * 40, y: 20 + index * 40} 
    }

    const cardPushNewPosition = (card: Card, side: string, area: string): void => {
        console.log(card, side, area);

    }

    return (
        <div ref={element} class="game">
            <div class="top">
                <div class="hand flex" data-action="top-hand">
                    <For each={[...Array(opponentHandCount()).keys()]}>{(_, index) => {
                            const cardData = opponentHiddenCard(opponentUuid, 'hand');
                            return (<OpponentHiddenCard
                                name={cardData.id}
                                cardData={cardData}
                                pathFront="card_back"
                                openActions={openActions}
                                pushNewPostion={cardPushNewPosition}
                                area="hand"
                            ></OpponentHiddenCard>)
                        }
                    }</For>
                </div>
                <div class="board">
                    <div class="area-1">
                        <div class="ressource flex" data-action="top-ressource">
                        <For each={[...Array(opponentResourcesCount()).keys()]}>{(_, index) => {
                                if (index() === 0 && opponentExhaustedResourcesCount()) {
                                    const cardData = opponentHiddenCard(opponentUuid, 'ressource', true);
                                    return (<OpponentHiddenCard
                                        name={cardData.id}
                                        cardData={cardData}
                                        pathFront="card_back"
                                        openActions={openActions}
                                        pushNewPostion={cardPushNewPosition}
                                        area="hand"
                                        count={opponentExhaustedResourcesCount()}
                                    ></OpponentHiddenCard>)
                                } else if (index() < opponentExhaustedResourcesCount()) {
                                    return (<></>);
                                } else if (opponentResourcesCount() > 9 && index() === opponentExhaustedResourcesCount()) {
                                    const cardData = opponentHiddenCard(opponentUuid, 'ressource', index() < opponentExhaustedResourcesCount());
                                    const count = opponentResourcesCount() - opponentExhaustedResourcesCount()
                                    console.log(opponentResourcesCount(), count )
                                    return (<OpponentHiddenCard
                                        name={cardData.id}
                                        cardData={cardData}
                                        pathFront="card_back"
                                        openActions={openActions}
                                        pushNewPostion={cardPushNewPosition}
                                        area="hand"
                                        count={count}
                                    ></OpponentHiddenCard>)
                                } else if (opponentResourcesCount() > 9) {
                                    return (<></>);
                                }
                                const cardData = opponentHiddenCard(opponentUuid, 'ressource', index() < opponentExhaustedResourcesCount());

                                return (<OpponentHiddenCard
                                    name={cardData.id}
                                    cardData={cardData}
                                    pathFront="card_back"
                                    openActions={openActions}
                                    pushNewPostion={cardPushNewPosition}
                                    area="hand"
                                ></OpponentHiddenCard>)
                            }
                        }</For>
                        
                        </div>
                        <div class="deck flex" data-action="top-deck">
                            <Deck
                                left={opponentDeckCount()}
                                openActions={openActions}
                            ></Deck>
                        </div>
                        <div class="discard flex" data-action="top-discard">
                            <DiscardPile
                                cardList={opponentDiscardPileCards()}
                            ></DiscardPile>
                        </div>
                    </div>
                    <div class="area-2">
                        <div class="ground flex" data-action="top-ground"></div>
                        <div class="middle">
                            <div class="base flex" data-action="top-base">
                                <Show when={opponentBase()}>
                                    {(c) => {
                                        const card = c();
                                        return <GameCard
                                            name={card.id}
                                            cardData={card}
                                            pathFront={"SOR/" + card.number}
                                            pathBack={card.type === 'Leader' ? "SOR/" + card.number + "-b" : undefined}
                                            openActions={openActions}
                                            pushNewPostion={cardPushNewPosition}
                                        ></GameCard>}
                                    }                                    
                                </Show>
                            </div>
                            <div class="leader flex" data-action="top-leader">
                                <Show when={opponentLeader()}>
                                    {(c) => {
                                        const card = c();
                                        return <GameCard
                                            name={card.id}
                                            cardData={card}
                                            pathFront={"SOR/" + card.number}
                                            pathBack={card.type === 'Leader' ? "SOR/" + card.number + "-b" : undefined}
                                            openActions={openActions}
                                            pushNewPostion={cardPushNewPosition}
                                        ></GameCard>}
                                    }                                    
                                </Show>
                            </div>
                        </div>
                        <div class="space flex" data-action="top-space"></div>
                    </div>
                </div>
            </div>
            <div class="bottom">
                <div class="board">
                    <div class="area-2">
                        <div class="ground flex" data-action="bottom-ground"></div>
                        <div class="middle">
                            <div class="leader flex" data-action="bottom-leader">
                                <Show when={leader()}>
                                    {(c) => {
                                        const card = c();
                                        return <GameCard
                                            name={card.id}
                                            cardData={card}
                                            pathFront={"SOR/" + card.number}
                                            pathBack={card.type === 'Leader' ? "SOR/" + card.number + "-b" : undefined}
                                            openActions={openActions}
                                            pushNewPostion={cardPushNewPosition}
                                        ></GameCard>}
                                    }                                    
                                </Show>
                            </div>
                            <div class="base flex" data-action="bottom-base">
                                <Show when={base()}>
                                    {(c) => {
                                        const card = c();
                                        console.log('base', card)
                                        return <GameCard
                                            name={card.id}
                                            cardData={card}
                                            pathFront={"SOR/" + card.number}
                                            pathBack={card.type === 'Leader' ? "SOR/" + card.number + "-b" : undefined}
                                            openActions={openActions}
                                            pushNewPostion={cardPushNewPosition}
                                        ></GameCard>}
                                    }                                    
                                </Show>
                            </div>
                        </div>
                        <div class="space flex" data-action="bottom-space"></div>
                    </div>
                    <div class="area-1">
                        <div class="ressource flex" data-action="bottom-ressource"></div>
                        <div class="deck flex" data-action="bottom-deck">
                            <Deck
                                left={deckCount()}
                                openActions={openActions}
                            ></Deck>
                        </div>
                        <div class="discard flex" data-action="bottom-discard">
                            <DiscardPile
                                cardList={discardPileCards()}
                            >
                            </DiscardPile>
                        </div>
                    </div>
                </div>
                <div class="hand flex" data-action="bottom-hand">
                    <For each={cards()}>{(card, index) => {
                        return (<GameCard
                            name={card.id}
                            cardData={card}
                            pathFront={"SOR/" + card.number}
                            pathBack={card.type === 'Leader' ? "SOR/" + card.number + "-b" : undefined}
                            openActions={openActions}
                            area="hand"
                            pushNewPostion={cardPushNewPosition}
                        ></GameCard>)
                        }
                    }</For>
                </div>
            </div>

            <Show when={actionsData()}>
                <Actions
                    data={actionsData() as ActionsData}
                    sendEvent={sendEvent}
                ></Actions>
            </Show>
        </div>
    );
};