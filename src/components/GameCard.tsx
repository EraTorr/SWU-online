import type { Component } from "solid-js";
import { mergeProps, createSignal, For, onMount, Show } from "solid-js";
import "../style/game-card.scss";
import type { Card } from "../helpers/card";
import { stopEvent } from "../helpers/app.helper";

interface GameCardProps {
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
  area: string;
  pushNewPostion: (card: Card, side: string, area: string, fromArea: string) => void;
}

export const GameCard: Component<GameCardProps> = (props) => {
  const merged = mergeProps(
    {
      name: "",
      pathFront: "",
      pathBack: "card_back",
      initPositionX: 0,
      initPositionY: 0,
      showActionList: true,
      owner: 1, // 2
      playerView: 1, // 2
    },
    props,
  );

  const [following, setFollowing] = createSignal(false);
  const [showActionListAlpine, setShowActionListAlpine] = createSignal(false);
  const [visibleSide, setVisibleSide] = createSignal('front');
  const [left, setLeft] = createSignal(merged.initPositionX);
  const [top, setTop] = createSignal(merged.initPositionY);

  let element!: HTMLDivElement;
  // onMount(() => {
  //   if (merged.cardData.type === 'Leader') {
  //     setVisibleSide('front')
  //   }
  // })

  const urlVisible = (display = false) => {
    if (display && merged.pathBack === 'card_back' && merged.playerView === merged.owner) {
      return 'https://ik.imagekit.io/nrqvxs6itqd/SWU/'+ merged.pathFront + '.png';
    }
    if (merged.cardData.type === 'Base') {
      return 'https://ik.imagekit.io/nrqvxs6itqd/SWU/'+ merged.pathFront + '.png';
    }
    return 'https://ik.imagekit.io/nrqvxs6itqd/SWU/'+ (visibleSide() === 'back' ? merged.pathBack : merged.pathFront) + '.png';
  }

  const follow = (event: any) => {
    stopEvent(event);

    if (!following()) {
      setFollowing(true);
      element.classList.add("selected");
      handleMouseMove(event);
      document.addEventListener("mousemove", handleMouseMove);
    } else {
      const dataPush = identifyClickArea(event);
      if (dataPush) {
        setFollowing(false);
        element.classList.remove("selected");
        document.removeEventListener("mousemove", handleMouseMove);
        props.pushNewPostion(props.cardData, dataPush.side, dataPush.area, props.area);
        setLeft(0);
        setTop(0);
      }
      
    }
    if (showActionListAlpine()) {
      toggleActionList();
    }
  };

  const identifyClickArea = (event: any) => {
    const els = document.elementsFromPoint(event.clientX, event.clientY) as Array<HTMLElement>;

    let [playerZone, area] = ['', ''];
    for(let i = 0; i < els.length; i++) {
      const dataAction = els[i].dataset.action
      if (dataAction) {
        [playerZone, area] = dataAction.split('-')
        break; 
      }
    }
  
    if (playerZone === '') {
      return null;
    }

    return {side: playerZone === 'top' ? 'opponent' : 'player', area};
  };

  const handleMouseMove = (event: any) => {
    const { clientX, clientY } = event;
    const domRect = element.getBoundingClientRect();

    setLeft(-domRect.width / 2 + clientX);
    setTop(-domRect.height / 2 + clientY);
  };

  const flip = (event: any) => {
    stopEvent(event);

    setVisibleSide(visibleSide() === 'back' ? 'front': 'back');

    if (showActionListAlpine()) {
      toggleActionList();
    }
    console.log('fl;ip');
    const e = new CustomEvent("sendMessage", { detail: {action: 'flip', data: 'test'}});
    document.dispatchEvent(e);
  };
  const toggleActionList = () => {
    setShowActionListAlpine(!showActionListAlpine());
  };
  const clickHandle = (event: any) => {
    stopEvent(event);
    if (event.ctrlKey) {
      flip(event);
      return;
    }
    if (event.shiftKey || following()) {
      follow(event);
      return;
    }

    merged.openActions({type: merged.cardData.type, card: merged.cardData, area: merged.area});
  };

  const alt = merged.cardData.name + (merged.cardData.subtitle ? ' - ' + merged.cardData.subtitle : '') + ' ' + merged.cardData.set + merged.cardData.number;

  return (
    <>
      <div ref={element} class="swu-card container" onClick={clickHandle}
        style={'top:'+ top() +'px; left: '+ left()+'px'} classList={{exhausted: !!merged.cardData.exhaust}}>
        <img
          class="in-game"
          src={	urlVisible() }
          alt={alt}
          draggable="false"
        />
      </div>
      <Show when={merged.cardData.id !== '0'}>
        <img
          class="swu-card in-display"
          src={urlVisible(true)}
          alt={alt}
          draggable="false"
        />
      </Show>
    </>
  );
};
