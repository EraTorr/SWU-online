import type { Component } from "solid-js";
import { mergeProps, createSignal } from "solid-js";
import "../style/GameCard.scss";

interface GameCardProps {
  name: string;
  pathFront: string;
  pathBack: string;
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
      pathBack: "",
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
  let element: HTMLElement;

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

    element.style.left = -domRect.width / 2 + clientX + "px";
    element.style.top = -domRect.height / 2 + clientY + "px";
  };
  const flip = (event: any) => {
    stopEvent(event);

    setVisibleSide(visibleSide() === 'back' ? 'front': 'back');

    if (showActionListAlpine()) {
      toggleActionList();
    }
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
    element.style.left = domRect.x + "px";
    element.style.top = domRect.y + "px";
  }

  return (
    <div ref={element} class="swu-card" onClick={clickHandle}>
      <img
        class="in-game"
        src={visibleSide() === 'back' ? merged.pathBack : merged.pathFront}
        alt={merged.name}
        draggable="false"
      />

      <img
        class="in-display"
        src={visibleSide() === 'back' ? merged.pathBack : merged.pathFront}
        alt={merged.name}
        draggable="false"
      />

      {merged.showActionList && (
        <ul class="action-list" classList={{ visible: showActionListAlpine() }}>
          <li onClick={flip}>
              Flip
          </li>
          <li onClick={follow}>
              Follow
          </li>
          <li onClick={() => moveTo('space')}>
              Move to space
          </li>
          <li onClick={() => moveTo('ground')}>
              Move to ground
          </li>
          <li onClick={() => moveTo('discard')}>
              Move to discard
          </li>
          <li onClick={() => moveTo('hand')}>
              Move to hand
          </li>
          <li onClick={() => moveTo('ressource')}>
              Move to ressource
          </li>
        </ul>
      )}
    </div>
  );
};
