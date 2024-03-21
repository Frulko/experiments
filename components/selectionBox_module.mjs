import SelectionBox from "./selectionBox/SelectionBox.js";

export const css = ["selectionBox/selectionBox.css"];
export const js = [];

export const connect = (element, data) => {
  const sbox = new SelectionBox({
    target: ".box",
  });
  sbox.setContainer(element);
  sbox.initEventListeners();
  sbox.onSelection((els) => {
    console.log("selected", els);
    // box.classList.toggle(
    //   "active",
    //   this.isColliding(this.selectionAreaEl, box)
    // );
  });

  console.log("[SelectionBox]", element, data);
};

export const disconnect = () => {};
