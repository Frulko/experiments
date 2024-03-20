import SelectionBox from "./selectionBox/SelectionBox.js";

export const css = ["selectionBox/selectionBox.css"];
export const js = [];

export const connect = (element, data) => {
  const sbox = new SelectionBox();
  sbox.setContainer(element);
  sbox.initEventListeners();

  console.log("[SelectionBox]", element, data);
};

export const disconnect = () => {};
