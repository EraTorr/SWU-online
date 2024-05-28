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
  area?: string;
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
      document.addEventListener("mousemove", handleMouseMove);
    } else {
      setFollowing(false);
      element.classList.remove("selected");
      document.removeEventListener("mousemove", handleMouseMove);
    }
    if (showActionListAlpine()) {
      toggleActionList();
    }
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

    merged.openActions({type: 'test', card: merged.name});
  };


  return (
    <>
      <div ref={element} class="swu-card container" onClick={clickHandle}
        style={'top:'+ top() +'px; left: '+ left()+'px'}>
        <img
          class="in-game"
          src={	urlVisible() }
          alt={merged.name}
          draggable="false"
        />
      </div>
      <Show when={merged.cardData.id !== '0'}>
        <img
          class="swu-card in-display"
          src={urlVisible(true)}
          alt={merged.name}
          draggable="false"
        />
      </Show>
    </>
  );
};
