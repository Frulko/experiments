export default class Marquee {
  constructor(opts = {}) {
    this.opts = {
      el: null,
      container: window,
      text: '',
      destroyEl: false,
      directLoad: true,
      autoplay: true,
      waitFontLoaded: false,
      direction: 1,
      fontFamily: 'Arial',
      duration: -1,
      timingAnimation: [1, 500], // 1 sec for 500px
      onEnd: () => {},
      ...opts,
    }

    // this.timingAnimation = [1, 5];

    this.handleFontLoaded()
  }

  handleFontLoaded(){
    this.init();
  }

  init() {
    this.factor = 1;
    this.clear();
    this.checkWidth();
  }

  getContainerWidth() {
    if (this.opts.container === window) {
      return window.innerWidth;
    }

    const rect = this.opts.container.getBoundingClientRect();
    return rect.width;
  }

  handleResize() {
    this.init();
  }

  updateText(text) {
    this.opts.text = text;
  
    this.factor = 1;
    this.clear();
    this.checkWidth();

    setTimeout(() => {
      this.clear();
      this.checkWidth();
    }, 100);
  }

  setText(texts) {

    const contentEl = this.opts.el.querySelector('.Marquee__Text');

    const els = texts.map((text) => {
      const textWrapper = document.createElement('span');
      textWrapper.innerHTML = text;
      contentEl.appendChild(textWrapper);

      return textWrapper;
    })
    
    const lastEl = els[els.length - 1];
    const rect = lastEl.getBoundingClientRect();
    return rect;
  }

  checkWidth() {
    /*
      Behaviour : Test and try put text in the zone and try if fit in. If not update factor and try again until it fit then clone and animate
      How to put defined space between word ? (via attribute not css) 
    */
    this.opts.el.querySelector('.Marquee__Text').innerHTML = '';

    let text = Array(this.factor);
    text.fill(this.opts.text);
    const lastBox = this.setText(text);
    
    // console.log(lastBox.x + lastBox.width, this.getContainerWidth());

    const isOut = (lastBox.x + lastBox.width) > this.getContainerWidth();
    if (!isOut) {
      ++this.factor;
      this.checkWidth();
    } else {
      const textEl = this.opts.el.querySelector('.Marquee__Text');
      const containerEl = this.opts.el.querySelector('.Marquee__Container');
      var duplicateEl = textEl.cloneNode(true);

      const width = textEl.getBoundingClientRect().width;
      containerEl.style.width = ((width * 2) + 0) + 'px';

      
      duplicateEl.classList.add('clone');
      containerEl.append(duplicateEl);
      containerEl.classList.add('animate');

      // Set correct duration to have the same feeling of speed between two size of text;
      

      let timing = this.opts.duration;

      if (this.opts.duration === -1) { // proportionnal duration between time and width; same time duration whatever the size of content to animate
        const [ durationRef, widthRef ] = this.opts.timingAnimation;
        timing = ((width * durationRef) / widthRef) * 2;
      }

      containerEl.style.animation = `slideinMarquee ${timing}s linear infinite`;
      if (this.opts.direction === -1) {
        containerEl.style.animationDirection = 'reverse';
      }
      
      this.opts.onEnd();
    }
  }

  clear() {
    
    const containerEl = this.opts.el.querySelector('.Marquee__Container');
    containerEl.style.animation = '';
    containerEl.style.width = (this.getContainerWidth() * 10) + 'px';
    containerEl.classList.remove('animate');

    this.opts.el.querySelectorAll('.Marquee__Text.clone').forEach((el) => {
      el.remove();
    });
  }

  update() {
    this.clear();
    this.checkWidth();
  }

  destroy() {
    this.opts.el.querySelector('.Marquee__Text').innerHTML = '';
    if (this.opts.destroyEl) {
      this.opts.el.remove();
    }
  }
}