export default class Shortcuts {
  constructor(container) {
    container.addEventListener("keydown", (e) => {
      console.log("e", e);
      // if (e.key === "s" && e.ctrlKey) {
      //   e.preventDefault();
      //   console.log("Save");
      // }
    });
  }
}
