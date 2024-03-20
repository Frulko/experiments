import Marquee from "./marquee/Marquee.js";

export const js = [
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js",
];
export const css = ["marquee/marquee.css"];
export const connect = (element, { text, direction, props, toolbar }) => {
  const initialHTML = element.innerHTML;

  element.innerHTML = /* html */ `
    <div class="marquee__container">
      ${initialHTML}
    </div>
  `;

  if (toolbar) {
    toolbar.code.setContent(element.innerHTML);
  }

  new Marquee({
    el: element.querySelector(".marquee__container"),
    container: element,
    text,
    destroyEl: false,
    directLoad: true,
    autoplay: true,
    fontFamily: "system-ui",
    direction,
    timingAnimation: [1, 100], // 1 sec for 500px
  });
};
