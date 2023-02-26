import * as Noodle from "./noodle/Noodle.js";

export const js = [ ];
export const css = [ './noodle/noodle.css' ];
export const connect = (element, { text, direction, props }) => {
  const initialHTML = element.innerHTML;

  element.innerHTML = /* html */`
    <div data-root="true" class="GraphViewer">
      <div class="GraphViewer__background"></div>
      <div class="GraphViewer__bind">
        <div class="GraphViewer__viewport" style=""></div>
        <div class="node" data-node="100" data-x="20" data-y="184" draggable="true" tabindex="0" style="transform: translate3d(20px, 184px, 0px);">
          <img src="./assets/img/site.jpeg" width="400" alt="">
        </div>
      </div>
    </div>
  `;



  let boardOrigin = [0, 0];
  let scaleFactor = 0.56155;
  const items = [];

  const onUpdateNodePosition = (e) => {
    // console.log('onUpdateNodePosition', dndInstance.nodes)
    document.querySelectorAll('.node').forEach((nodeEl) => {
  
  
      const id = nodeEl.getAttribute('data-node');
      const source = nodeEl.getAttribute('data-source');
      const x = +nodeEl.getAttribute('data-x');
      const y = +nodeEl.getAttribute('data-y');
  
      // const s = sources.find((sourceGroup) => sourceGroup.label === source);
      console.log('-->', id, source, x, y,)
  
      // const vecA = s.points.find((point) => point.id === id);
      // vecA.x = x;
      // vecA.y = y;
    });
  
  }

  const backgroundEl = document.querySelector('.GraphViewer__background');
  const onUpdateBoardOrigin = ({k, x, y}) => {
    if (x === 0 && y === 0 ) {
      return;
    }

    // localStorage.setItem('board', JSON.stringify({k, x, y}));


    const size = 30;
    backgroundEl.style.backgroundSize = `${size * k}px ${size * k}px`;
    backgroundEl.style.backgroundPosition = `${x}px ${y}px`;
  }


  const onKeyEvent = (state, evt, selection) => {
    // console.log('--> event', state, evt, selection);

  }

  const onScaleFactor = (e) => {
    console.log('onScaleFactor', e)
  }

  Noodle.setProjectedViewport(1000, 1000);
  Noodle.initNodes();

  const dndInstance = Noodle.projectionEditor(
    boardOrigin,
    scaleFactor,
    items,
    onUpdateNodePosition,
    onUpdateBoardOrigin,
    onScaleFactor,
    onKeyEvent
  );

  console.log('dndInstance', dndInstance)
  
}


