import type { Component } from "solid-js";
import { mergeProps, createSignal, For } from "solid-js";
import "../style/GameCard.scss";

interface GameCardProps {
  name: string;
  pathFront: string;
  pathBack?: string;
  initPositionX?: number;
  initPositionY?: number;
  showActionList?: boolean;
  owner?: number;
  playerView?: number;
}

export const GameCard: Component<GameCardProps> = (props) => {
  const merged = mergeProps(
    {
      name: "",
      pathFront: "",
      pathBack: "card_back",
      initPositionX: 10,
      initPositionY: 10,
      showActionList: true,
      owner: 1, // 2
      playerView: 1 // 2
    },
    props,
  );

  const [following, setFollowing] = createSignal(false);
  const [showActionListAlpine, setShowActionListAlpine] = createSignal(false);
  const [visibleSide, setVisibleSide] = createSignal('back');
  const [left, setLeft] = createSignal(merged.initPositionX);
  const [top, setTop] = createSignal(merged.initPositionY);

  let element: HTMLDivElement;

const urlVisible = (display = false) => {
    if (display && merged.pathBack === 'card_back' && merged.playerView === merged.owner) {
      return 'https://ik.imagekit.io/nrqvxs6itqd/SWU/'+ merged.pathFront + '.png';
    }
    return 'https://ik.imagekit.io/nrqvxs6itqd/SWU/'+ (visibleSide() === 'back' ? merged.pathBack : merged.pathFront) + '.png';
  }
  const stopEvent = (event: any) => {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
  };
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

    toggleActionList();
  };
  const clickOutsideHandle = () => {
    if (showActionListAlpine()) {
      toggleActionList();
    }
  };
  const moveTo = (target: string) => {
    console.log('test', target);
    let side = 'bottom';
    if (merged.playerView === 1) {
      side = merged.owner === 1 ? 'bottom': 'top';
    } else {
      side = merged.owner === 1 ? 'top': 'bottom';
    }
    const targetElement = document.querySelectorAll(`.${side} .${target}`)[0];
    const domRect = targetElement.getBoundingClientRect()
    setLeft(domRect.x);
    setTop(domRect.y);
  }

  const actionList = (cardType: string) => {
    const action = [];

    if (cardType) {
      action.push(
        [flip, 'Flip'],
        [follow, 'Follow'],
        [() => moveTo('space'), 'Move to space'],
        [() => moveTo('ground'), 'Move to ground'],
        [() => moveTo('discard'), 'Move to discard'],
        [() => moveTo('hand'), 'Move to hand'],
        [() => moveTo('ressource'), 'Move to ressource'],
      );
    }

    return action;
  }

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



        {merged.showActionList && (
          <ul class="action-list" classList={{ visible: showActionListAlpine() }}>
            <For each={actionList('test')}>{(action) =>
              <li onClick={action[0]}>
                  {action[1]}
              </li>
            }</For>
          </ul>
        )}
      </div>
      <img
        class="swu-card in-display"
        src={urlVisible(true)}
        alt={merged.name}
        draggable="false"
      />
    </>
  );
};
