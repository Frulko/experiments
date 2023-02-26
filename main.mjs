




const loadComponent = (el, name) => {
  const controllerPath = './components/';
  const controllerName = name;
  const fullModuleName = `${controllerPath}${controllerName}_module.mjs`;

  import(fullModuleName).then(async (m) => {
    
    if (m.css) {
      // m.css.map((file) => `${controllerPath}${file}`).forEach((file) => loadCSS(file, controllerName));
      for (let i = 0; i < m.css.length; i++) {
        const file = m.css[i];
        await loadCSS(`${controllerPath}${file}`, controllerName + '_' + i);
      }
    }

    if(m.js) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
      for (let i = 0; i < m.js.length; i++) {
        const file = m.js[i];

        const filePath = file.includes('http') ? file: `${controllerPath}${file}`;

        await loadJS(filePath, controllerName + '_' + i);
      }
    }

    m.connect(el, getDataFromElementAttributes(el.parentNode));
  }).catch((err) => {
    console.error(err);
  })
}

// document.querySelectorAll('*[data-component]').forEach(loadComponent);

const parseAttributeValue = (inputValue) => {
  let outputValue = /^-?\d+$/.test(inputValue) ? +inputValue: inputValue; // test if number

  if (/^true|false$/i.test(inputValue)) { // test if boolean
    outputValue = inputValue === 'true';
  }

  return outputValue;
}

const getDataFromElementAttributes = (el) => {
  const attributes = {};
 
  [].forEach.call(el.attributes, ({ name, value }) => {
    if (/^data-/.test(name)) {
        var camelCaseName = name.substr(5).replace(/-(.)/g, function ($0, $1) {
            return $1.toUpperCase();
        });
        attributes[camelCaseName] = parseAttributeValue(value);
    }
  });
  return attributes;
}


const t = {}

const loadCSS = (path, moduleName) => {
  const identifier = `style_${moduleName}`;

  if (typeof t[identifier] === 'undefined') {
    t[identifier] = {
      loaded: false,
      error: false,
      refs: [],
      update: () => {
        const m = t[identifier];
        if (!(m.loaded || m.error)) {
          return;
        }

        m.refs.forEach(({resolve, reject}) => m.loaded ? resolve(): reject());
      }
    };
  }

  if (document.getElementById(identifier)) {
    t[identifier].update();
    return new Promise(checkScriptIsLoaded(t[identifier])); //skip already loaded
  }

  const styleEl = document.createElement('link');
  styleEl.id = identifier;
  styleEl.href = path;
  styleEl.rel = 'stylesheet';

  document.querySelector('head').appendChild(styleEl);

  styleEl.onload = () => {
    t[identifier].loaded = true;
    t[identifier].update();
  }

  styleEl.onerror = () => {
    t[identifier].error = true;
  }

  return new Promise(checkScriptIsLoaded(t[identifier]));
}




const checkScriptIsLoaded = (scriptHandler) => {
  return (resolve, reject) => {
    scriptHandler.refs.push({ resolve, reject })
  }
}

const loadJS = (path, moduleName) => {
  const identifier = `script_${moduleName}`;
  
  if (typeof t[identifier] === 'undefined') {
    t[identifier] = {
      loaded: false,
      error: false,
      refs: [],
      update: () => {
        const m = t[identifier];
        if (!(m.loaded || m.error)) {
          return;
        }

        m.refs.forEach(({resolve, reject}) => m.loaded ? resolve(): reject());
      }
    };
  }



  // issue need a global loading scripts references for resolving only when script is loaded even if multiple controller need it
  if (document.getElementById(identifier)) {
    t[identifier].update();
    return new Promise(checkScriptIsLoaded(t[identifier])); //skip already loaded
  }

  const scriptEl = document.createElement('script');
  scriptEl.id = identifier
  scriptEl.src = path
  scriptEl.type = 'application/javascript'

  document.querySelector('body').appendChild(scriptEl);

  scriptEl.onload = () => {
    t[identifier].loaded = true;
    t[identifier].update();
  }

  scriptEl.onerror = () => {
    t[identifier].error = true;
  }

  return new Promise(checkScriptIsLoaded(t[identifier]));
}

/**
 * Maybe need a compiler like webpack or vite or esbuild
 * output a manifest file (js, json ?) with the name for each controller for importing
 * the benefit of using a bundler is to have one js file with all project
 * how to share utils ? the script embed is local to a controller/module
 */

class SandboxBlock extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

   
  }

  connectedCallback() {

    const infoEl = this.querySelector('sandbox-info');

    if (infoEl) {
      this.removeChild(infoEl);
    }

    const children = this.innerHTML;
    this.innerHTML = '';


    const loading = this.getAttribute('loading');
    const autoplay = parseAttributeValue(this.getAttribute('autoplay')) ?? true;

    

    const sandboxWrapperElement = document.createElement('div');
    sandboxWrapperElement.classList.add('sandbox__wrapper');
    sandboxWrapperElement.innerHTML = children;
    this.appendChild(sandboxWrapperElement);


    const bottomEl = document.createElement('div');
    bottomEl.classList.add('sandbox__meta');


    if (this.hasAttribute('data-caption')) {
      const captionElement = document.createElement('h3');
      captionElement.classList.add('sandbox__caption');
      captionElement.innerText = this.getAttribute('data-caption');
      bottomEl.appendChild(captionElement);
    }

    if (infoEl) {
      bottomEl.appendChild(infoEl);
    }
    

    this.appendChild(bottomEl);

    if (this.hasAttribute('data-component')) {
      this.classList.add(`sandbox__${this.getAttribute('data-component')}`, 'loaded')
      autoplay && loadComponent(sandboxWrapperElement, this.getAttribute('data-component'));
    } else {
      this.classList.add('empty')
      sandboxWrapperElement.innerHTML = 'No component found !'
    }
    
  }
}

customElements.define('sandbox-block', SandboxBlock)

class SandboxInfo extends HTMLElement {
  connectedCallback() {
    const children = this.innerHTML;
    this.innerHTML = '';


    const buttonEl = document.createElement('button');
    buttonEl.classList.add('d')
    buttonEl.innerHTML = /* html */`
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    `;

    buttonEl.addEventListener('click', () => {
      this.classList.toggle('active')
    })

    const contentEl = document.createElement('div');
    contentEl.classList.add('a')
    contentEl.innerHTML = children;

    this.appendChild(buttonEl);
    this.appendChild(contentEl);
  }
}

customElements.define('sandbox-info', SandboxInfo)