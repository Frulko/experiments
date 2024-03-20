export default class SelectionBox {
  selectionAreaBox = {
    x: 0,
    y: 0,
    endx: 0,
    endy: 0,
    initialized: false,
  };

  selectedItems = [];
  selectionAreaEl = null;

  isDragging = false;
  mouseDown = false;

  constructor() {}

  setContainer(container) {
    this.container = container;

    this.selectionAreaEl = document.createElement("div");
    this.selectionAreaEl.classList.add("selection_box", "hide");

    this.container.appendChild(this.selectionAreaEl);
  }

  initEventListeners() {
    this.container.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this),
      false
    );
    this.container.addEventListener(
      "mouseup",
      this.handleMouseUp.bind(this),
      false
    );
    this.container.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this),
      false
    );
  }

  isColliding(box1, box2) {
    const box1Rect = box1.getBoundingClientRect();
    const box2Rect = box2.getBoundingClientRect();

    return (
      box1Rect.top < box2Rect.bottom &&
      box1Rect.bottom > box2Rect.top &&
      box1Rect.left < box2Rect.right &&
      box1Rect.right > box2Rect.left
    );
  }

  checkCollisions() {
    const boxes = document.querySelectorAll(".box");
    boxes.forEach((box) => {
      // if (this.isColliding(this.selectionAreaEl, box)) {
      //   console.log("Collision detected with:", box);
      //   // Ajoutez ici votre logique pour traiter la collision
      // } else {
      //   console.log("No collision detected with:", box);
      // }

      box.classList.toggle(
        "active",
        this.isColliding(this.selectionAreaEl, box)
      );
    });
  }

  handleMouseDown(event) {
    this.mouseDown = true;
    const [evtX, evtY] = this.getPosFromEvent(event.x, event.y);

    this.selectionAreaBox.x = evtX; // take event.x + box offset of container pos
    this.selectionAreaBox.y = evtY;
    this.selectionAreaBox.initialized = true;
    this.renderSelectionAreaBox();
    this.checkCollisions();
  }

  handleMouseUp(event) {
    this.mouseDown = false;
    this.isDragging = false;
    const [evtX, evtY] = this.getPosFromEvent(event.x, event.y);
    const selectionIsAtSamePosition =
      this.selectionAreaBox.x === evtX && this.selectionAreaBox.y === evtY;
    if (selectionIsAtSamePosition || this.selectionAreaBox.initialized) {
      this.resetSelectionBoxArea();
    }

    if (selectionIsAtSamePosition) {
      console.log("selection is at same position");
    }

    this.selectionAreaBox.x = evtX; // take event.x + box offset of container pos
    this.selectionAreaBox.y = evtY;
    this.selectionAreaBox.initialized = true;
  }

  handleMouseMove(event) {
    const [evtX, evtY] = this.getPosFromEvent(event.x, event.y);
    if (this.mouseDown && !this.isDragging) {
      /* SELECTION BEHAVIOR PUT THIS INTO A CLASS */
      const { x, y } = this.selectionAreaBox;

      const endX = evtX;
      const endY = evtY;
      if (x !== endX && y !== endY) {
        this.showSelectionBox();
        // if same pos do nothing
        // const rectPos = positionningRect2Dom([x, y], [endX, endY]);
        // this.selectionAreaBox = { ...rectPos };
        this.selectionAreaBox.endx = evtX;
        this.selectionAreaBox.endy = evtY;
        this.renderSelectionAreaBox();
        this.checkCollisions();
      }
      /* SELECTION BEHAVIOR PUT THIS INTO A CLASS */
    }
  }

  renderSelectionAreaBox() {
    /* SELECTION BEHAVIOR PUT THIS INTO A CLASS */

    if (this.selectionAreaEl === null) {
      return;
    }

    const { x, y, endx, endy } = this.selectionAreaBox;
    this.updateSelectionBoxDOM([x, y], [endx, endy]);
  }
  resetSelectionBoxArea() {
    this.hideSelectionBox();

    this.selectionAreaBox = {
      x: 0,
      y: 0,
      endx: 0,
      endy: 0,
      initialized: false,
    };
  }

  hideSelectionBox() {
    this.selectionAreaEl.classList.add("hide");
  }

  showSelectionBox() {
    this.selectionAreaEl.classList.remove("hide");
  }

  updateSelectionBoxDOM(start, end) {
    const { transform, width, height } = rectPositionToCSSProperties(
      positionningRect2Dom(start, end)
    );

    this.selectionAreaEl.style.transform = transform;
    this.selectionAreaEl.style.width = width;
    this.selectionAreaEl.style.height = height;
  }

  getPosFromEvent(x, y) {
    const { x: containerX, y: containerY } =
      this.container.getBoundingClientRect();

    const evtX = x - containerX;
    const evtY = y - containerY;
    return [evtX, evtY];
  }
}
