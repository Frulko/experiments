import Marquee from "./marquee/Marquee.js";

export const css = ['marquee/marquee.css'];
export const connect = (element, { text, direction }) => {

  element.innerHTML = /* html */`
    <div class="Marquee__Container">
      <div class="Marquee__Text"></div>
    </div>
  `;

  new Marquee({
    el: element,
    container: window,
    text,
    destroyEl: false,
    directLoad: true,
    autoplay: true,
    fontFamily: 'system-ui',
    direction,
    timingAnimation: [1, 100], // 1 sec for 500px
  });
}