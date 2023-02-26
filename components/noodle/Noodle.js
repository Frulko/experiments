import DragNDrop from "./DragNDrop.js";

const getTranslatationFromScaleFactor = ([x, y]) => {
  return [x, y];
};

let boardOrigin = [0, 0];
let scaleFactor = 0.56155;

const localTransform = localStorage.getItem('board');
if (localTransform !== null) {
  const {x, y, k} = JSON.parse(localTransform); 
  boardOrigin = [x, y];
  scaleFactor = k;
}


const items = [];
const onUpdateNodePosition = (e) => {
  console.log('onUpdateNodePosition', e)
}

const backgroundEl = document.querySelector('.GraphViewer__background');
const onUpdateBoardOrigin = ({k, x, y}) => {
  localStorage.setItem('board', JSON.stringify({k, x, y}));


  const size = 30;
  backgroundEl.style.backgroundSize = `${size * k}px ${size * k}px`;
  backgroundEl.style.backgroundPosition = `${x}px ${y}px`;
}

const onScaleFactor = (e) => {
  console.log('onScaleFactor', e)
}

export const projectionEditor = (
  boardOrigin,
  scaleFactor,
  items,
  onUpdateNodePosition,
  onUpdateBoardOrigin,
  onScaleFactor,
  onKeyEventExternal
) => {


  let xy = getTranslatationFromScaleFactor(boardOrigin, scaleFactor);
  
  // const [ _xy, _setPosition ] = useState([posX, posY]);
  const bind = {
    ref: {
      current: document.querySelector('.GraphViewer')
    },
  }

  const boardBind = {
    ref: {
      current: document.querySelector('.GraphViewer__bind')
    },
  }

  const setPosition = (pos) => {
    // _setPosition(pos);
    // xy = pos;
    // boardBind.ref.current.style.transform = `translate3d(${pos[0]}px, ${pos[1]}px, 0) scale(${scaleFactor})`;
  }

  let dragNDropInstance = null;
  let isShifted = false;

  const onScaleHandler = ({scale, origin}) => {
    // console.log('scale', p)
    // boardBind.ref.current.style.transform = `translate3d(${origin[0]}px, ${origin[1]}px, 0) scale(${scale})`;
  }

  const onDragHandler = (evt) => {
    // console.log('onDragHandler', evt)
    if (evt.first) {
      // console.log('first');
      if (isShifted && evt.node) {
        console.log('add', evt.target);
      }
    }

    if (evt.moving ) {
      const [deltaX, deltaY] = evt.delta;
      const [x, y] = xy;
      
      const pos = [
        x + deltaX,
        y + deltaY
      ];

      
      setPosition(pos);
      dragNDropInstance.setOrigin(pos);
    }

    if (evt.last) {

      
      // console.log(evt.native.target, id, );
     
      // console.log(evt.selection, evt.unselection);

      if (evt.node) {
        
        const id = evt.target.getAttribute('data-node');
        onUpdateNodePosition();

        // console.log(id, evt.pos);
        // items[id].posX = evt.pos[0];
        // items[id].posY = evt.pos[1];
        // // console.log('|->>>', evt.pos, [plop[id].posX, plop[id].posY], evt.newPosition);
        /* items[id].ref.current.external_onClickEvent();
        
        const triggerSelectionEvent = (node, isSelected) => {
          const id = node.getAttribute('data-node');
          const el = items[id].ref.current;
          
          if (isSelected) {
            el.external_onClickEvent()
            return;
          }

          el.external_onUnselectedEvent();
        }

        for(let selectedIndex in evt.selection) {
          triggerSelectionEvent(evt.selection[selectedIndex], true);
        }

        for(let unSelectedIndex in evt.unselection) {
          triggerSelectionEvent(evt.unselection[unSelectedIndex], false);
        } */
        
      } else {
        
        // onUpdateBoardOrigin(xy);

        // for (let i = 0, l = evt.selection.length; i < l; i++) {
        //   const id =  evt.selection[i].getAttribute('data-node');
        //   items[id].ref.current.external_onUnselectedEvent();
        // }
      }
      // plop[id].ref.current.external_update_state_function('click')
    }

    if (!evt.first && !evt.last) {
      //  // console.log(event.x, draggedClickPositionOffset[0]);
      // const posX = getPosByScale(event.x - draggedClickPositionOffset[0], );
      // const posY = getPosByScale(event.y - draggedClickPositionOffset[1], );
      // dragged.style.transform = `translate3d(${posX}px, ${posY}px, 0px)`;
    }
  }


  const onKeyEventHandler = (state, evt) => {
    
    // if (state !== 'down') {
    //   isShifted = false;
    //   bind.ref.current.dragNDropInstance.setDraggingBoard(false);
    //   return;
    // }

    // if (evt.keyCode === 16) {
    //   bind.ref.current.dragNDropInstance.setDraggingBoard(true);
    //   isShifted = true;
    // }


    // if (evt.keyCode === 82 && state === 'down') { // r
    //   bind.ref.current.dragNDropInstance.reset();
    // }

    // if (evt.keyCode === 70 && state === 'down') { // f
    //   bind.ref.current.dragNDropInstance.fitToScreen();
    // }

    onKeyEventExternal(state, evt, bind.ref.current.dragNDropInstance.selectedNodes);
  }

  

  
  // create a new instance of DragNDrop class and attach it to the ref.. 
  /*
    purpose of this is to create only one instance of drag by binding,
    without that at each state update we create a new DnD class and detach, attach events...
    it not really good for speed
  */
  if (typeof bind.ref.current.dragNDropInstance === 'undefined') {
    bind.ref.current.dragNDropInstance = new DragNDrop({
      origin: xy,
      scaleFactor,
      el: boardBind.ref.current,
    });
  }

  dragNDropInstance = bind.ref.current.dragNDropInstance;

  boardBind.ref.current.style.transformOrigin = '0 0';
  // boardBind.ref.current.style.transform = `translate3d(${xy[0]}px, ${xy[1]}px, 0) scale(${scaleFactor})`;

  dragNDropInstance.setContainer(bind.ref.current);
  dragNDropInstance.onDrag(onDragHandler.bind(this));
  dragNDropInstance.onScale(onScaleHandler.bind(this));
  dragNDropInstance.onKeyEvent(onKeyEventHandler.bind(this));
  dragNDropInstance.onBoardTransform(onUpdateBoardOrigin.bind(this));

  dragNDropInstance.initEventListeners();

  return dragNDropInstance;
  // return {
  //   bind,
  //   boardBind,
  // };
}


export const initNodes = () => {
  const el = document.querySelector('.GraphViewer__bind');
  const nodes = [[0,0],[20,184],[550,20],[800,200],[800,800]].map(([x, y], id) => {
    return { id, x, y }
  })


  nodes.forEach(({id, x, y}) => {
    const nodeEl = document.createElement('div');
    nodeEl.classList.add('node');
    nodeEl.setAttribute('data-node', id);
    nodeEl.setAttribute('data-x', x);
    nodeEl.setAttribute('data-y', y);
    nodeEl.setAttribute('draggable', 'true');
    nodeEl.setAttribute('tabIndex', '0');
    nodeEl.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
    el.appendChild(nodeEl);
  })
}

export const setProjectedViewport = (width, height) => {
  const viewportEl = document.querySelector('.GraphViewer__viewport');
  viewportEl.style.width = width + 'px';
  viewportEl.style.height = height + 'px';
}

