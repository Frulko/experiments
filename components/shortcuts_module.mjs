import Shortcuts from "./shortcuts/Shortcuts.js";

export const css = ["shortcuts/shortcuts.css"];
export const js = [];

export const connect = (element, data) => {
  element.setAttribute("contenteditable", true);
  element.addEventListener("keydown", (e) => {
    e.preventDefault();
  });
  const shortcuts = new Shortcuts(element);

  console.log("[Shortcuts]", element, data);
};

export const disconnect = () => {};
