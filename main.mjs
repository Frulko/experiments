function formatHTML(html) {
  let formattedHTML = "";
  let indentLevel = 0;
  const indentSize = 2;

  const tagsToIndent = [
    "html",
    "head",
    "body",
    "div",
    "p",
    "ul",
    "ol",
    "li",
    "table",
    "tr",
    "td",
  ];

  const openingTagRegex = /<([a-z]+)(\s[^>]*)?>/g;
  const closingTagRegex = /<\/([a-z]+)>/g;
  const selfClosingTagRegex = /<([a-z]+)(\s[^>]*)?\/>/g;

  html = html.replace(/\r?\n|\r/g, ""); // Remove existing line breaks

  html = html.replace(openingTagRegex, (match, tagName, attributes) => {
    const indent = " ".repeat(indentLevel * indentSize);
    const formattedTag = `<${tagName}${attributes}>`;
    const shouldIndent = tagsToIndent.includes(tagName);
    indentLevel += shouldIndent ? 1 : 0;
    formattedHTML += `\n${indent}${formattedTag}`;
    return "";
  });

  html = html.replace(closingTagRegex, (match, tagName) => {
    indentLevel -= tagsToIndent.includes(tagName) ? 1 : 0;
    const indent = " ".repeat(indentLevel * indentSize);
    const formattedTag = `</${tagName}>`;
    formattedHTML += `\n${indent}${formattedTag}`;
    return "";
  });

  html = html.replace(selfClosingTagRegex, (match, tagName, attributes) => {
    const indent = " ".repeat(indentLevel * indentSize);
    const formattedTag = `<${tagName}${attributes}/>`;
    const shouldIndent = tagsToIndent.includes(tagName);
    formattedHTML += `\n${indent}${formattedTag}`;
    return "";
  });

  formattedHTML += html.trim(); // Append any remaining text

  return formattedHTML.trim();
}

function convertToMultilineWithIndentation(htmlString) {
  // Remove leading/trailing white spaces
  htmlString = htmlString.trim();

  // Indentation settings
  const indentSize = 2;
  const indentChar = " ";

  // Split the HTML string by opening and closing tags
  const tags = htmlString.split(/(<\/?\w+[^>]*>)/);

  let result = "";
  let indentLevel = 0;

  // Process each tag and add indentation
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    if (tag.startsWith("</")) {
      // Closing tag, decrease the indentation level
      indentLevel--;
    }

    // Add indentation to the current line
    const indentation = indentChar.repeat(indentSize * indentLevel);
    const indentedTag = indentation + tag;

    // Add the indented tag to the result
    result += indentedTag;

    if (tag.startsWith("<") && !tag.endsWith("/>")) {
      // Opening tag, increase the indentation level
      indentLevel++;
    }

    if (i < tags.length - 1) {
      // Add a line break after each tag
      result += "\n";
    }
  }

  return result;
}

const loadComponent = (el, name, extraData = {}) => {
  const controllerPath = "./components/";
  const controllerName = name;
  const fullModuleName = `${controllerPath}${controllerName}_module.mjs`;

  import(fullModuleName)
    .then(async (m) => {
      if (m.css) {
        // m.css.map((file) => `${controllerPath}${file}`).forEach((file) => loadCSS(file, controllerName));
        for (let i = 0; i < m.css.length; i++) {
          const file = m.css[i];
          await loadCSS(`${controllerPath}${file}`, controllerName + "_" + i);
        }
      }

      if (m.js) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
        for (let i = 0; i < m.js.length; i++) {
          const file = m.js[i];

          const filePath = file.includes("http")
            ? file
            : `${controllerPath}${file}`;

          await loadJS(filePath, controllerName + "_" + i);
        }
      }

      const attr = getDataFromElementAttributes(el.parentNode);
      // const toolbar = {
      //   info: (infoString) => {
      //     console.log('infoString', infoString);
      //   },
      //   code: (codeString) => {
      //     console.log(formatHTML(codeString));
      //   }
      // }

      m.connect(el, { ...attr, ...extraData });
    })
    .catch((err) => {
      console.error(err);
    });
};

// document.querySelectorAll('*[data-component]').forEach(loadComponent);

const parseAttributeValue = (inputValue) => {
  let outputValue = /^-?\d+$/.test(inputValue) ? +inputValue : inputValue; // test if number

  if (/^true|false$/i.test(inputValue)) {
    // test if boolean
    outputValue = inputValue === "true";
  }

  return outputValue;
};

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
};

const t = {};

const loadCSS = (path, moduleName) => {
  const identifier = `style_${moduleName}`;

  if (typeof t[identifier] === "undefined") {
    t[identifier] = {
      loaded: false,
      error: false,
      refs: [],
      update: () => {
        const m = t[identifier];
        if (!(m.loaded || m.error)) {
          return;
        }

        m.refs.forEach(({ resolve, reject }) =>
          m.loaded ? resolve() : reject()
        );
      },
    };
  }

  if (document.getElementById(identifier)) {
    t[identifier].update();
    return new Promise(checkScriptIsLoaded(t[identifier])); //skip already loaded
  }

  const styleEl = document.createElement("link");
  styleEl.id = identifier;
  styleEl.href = path;
  styleEl.rel = "stylesheet";

  document.querySelector("head").appendChild(styleEl);

  styleEl.onload = () => {
    t[identifier].loaded = true;
    t[identifier].update();
  };

  styleEl.onerror = () => {
    t[identifier].error = true;
  };

  return new Promise(checkScriptIsLoaded(t[identifier]));
};

const checkScriptIsLoaded = (scriptHandler) => {
  return (resolve, reject) => {
    scriptHandler.refs.push({ resolve, reject });
  };
};

const loadJS = (path, moduleName) => {
  const identifier = `script_${moduleName}`;

  if (typeof t[identifier] === "undefined") {
    t[identifier] = {
      loaded: false,
      error: false,
      refs: [],
      update: () => {
        const m = t[identifier];
        if (!(m.loaded || m.error)) {
          return;
        }

        m.refs.forEach(({ resolve, reject }) =>
          m.loaded ? resolve() : reject()
        );
      },
    };
  }

  // issue need a global loading scripts references for resolving only when script is loaded even if multiple controller need it
  if (document.getElementById(identifier)) {
    t[identifier].update();
    return new Promise(checkScriptIsLoaded(t[identifier])); //skip already loaded
  }

  const scriptEl = document.createElement("script");
  scriptEl.id = identifier;
  scriptEl.src = path;
  scriptEl.type = "application/javascript";

  document.querySelector("body").appendChild(scriptEl);

  scriptEl.onload = () => {
    t[identifier].loaded = true;
    t[identifier].update();
  };

  scriptEl.onerror = () => {
    t[identifier].error = true;
  };

  return new Promise(checkScriptIsLoaded(t[identifier]));
};

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
    const infoEl = this.querySelector("sandbox-info");

    if (infoEl) {
      this.removeChild(infoEl);
    }

    const codeEl = this.querySelector("sandbox-code");

    if (codeEl) {
      this.removeChild(codeEl);
    }

    const children = this.innerHTML;
    this.innerHTML = "";

    const loading = this.getAttribute("loading");
    const autoplay = parseAttributeValue(this.getAttribute("autoplay")) ?? true;

    const sandboxWrapperElement = document.createElement("div");
    sandboxWrapperElement.classList.add("sandbox__wrapper");
    sandboxWrapperElement.innerHTML = children;
    this.appendChild(sandboxWrapperElement);

    const bottomEl = document.createElement("div");
    bottomEl.classList.add("sandbox__meta");

    if (this.hasAttribute("data-route")) {
      const route = this.getAttribute("data-route");

      if (window.decoded !== route) {
        this.style.display = "none";
        return;
      }

      // this.parentNode.removeChild(this);
    } else {
      if (window.decoded && window.decoded.length > 0) {
        this.style.display = "none";
        return;
      }
    }

    if (this.hasAttribute("data-caption")) {
      const captionElement = document.createElement("h3");
      captionElement.classList.add("sandbox__caption");
      captionElement.innerText = this.getAttribute("data-caption");
      bottomEl.appendChild(captionElement);
    }

    const toolbarEl = document.createElement("div");
    toolbarEl.classList.add("toolbar");

    if (infoEl) {
      toolbarEl.appendChild(infoEl);
    }

    if (codeEl) {
      toolbarEl.appendChild(codeEl);
    }

    bottomEl.appendChild(toolbarEl);

    this.appendChild(bottomEl);

    if (this.hasAttribute("data-component")) {
      this.classList.add(
        `sandbox__${this.getAttribute("data-component")}`,
        "loaded"
      );
      const data = {};
      if (codeEl || infoEl) {
        data.toolbar = {};

        if (codeEl) {
          data.toolbar.code = codeEl;
        }

        if (codeEl) {
          data.toolbar.info = infoEl;
        }
      }

      autoplay &&
        loadComponent(
          sandboxWrapperElement,
          this.getAttribute("data-component"),
          data
        );
    } else {
      this.classList.add("empty");
      sandboxWrapperElement.innerHTML = "No component found !";
    }
  }
}

customElements.define("sandbox-block", SandboxBlock);

class SandboxInfo extends HTMLElement {
  connectedCallback() {
    const children = this.innerHTML;
    this.innerHTML = "";

    const buttonEl = document.createElement("button");
    buttonEl.classList.add("d");
    buttonEl.innerHTML = /* html */ `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M431-330q1-72 16.5-105t58.5-72q42-38 64.5-70.5T593-647q0-45-30-75t-84-30q-52 0-80 29.5T358-661l-84-37q22-59 74.5-100.5T479-840q100 0 154 55.5T687-651q0 48-20.5 87T601-482q-49 47-59 72t-11 80H431Zm48 250q-29 0-49.5-20.5T409-150q0-29 20.5-49.5T479-220q29 0 49.5 20.5T549-150q0 29-20.5 49.5T479-80Z"/>
      </svg>
    `;

    buttonEl.addEventListener("click", () => {
      this.classList.toggle("active");
    });

    const contentEl = document.createElement("div");
    contentEl.classList.add("a");
    contentEl.innerHTML = children;

    this.appendChild(buttonEl);
    this.appendChild(contentEl);
  }
}

customElements.define("sandbox-info", SandboxInfo);

class SandboxCode extends HTMLElement {
  connectedCallback() {
    loadCSS(
      "https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/themes/prism.css",
      "prism"
    );
    // loadCSS('//cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/default.min.css', 'highlightjs')
    loadJS(
      "https://cdn.jsdelivr.net/npm/indent.js@0.3.5/lib/indent.min.js",
      "indent"
    );
    loadJS("https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js", "prism");
    loadJS(
      "https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/plugins/autoloader/prism-autoloader.min.js",
      "prism-core"
    );
    // loadJS('//cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js', 'highlightjs')

    const children = this.innerHTML;
    this.innerHTML = "";

    const buttonEl = document.createElement("button");
    buttonEl.classList.add("c");
    buttonEl.innerHTML = /* html */ `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M320-242 80-482l242-242 43 43-199 199 197 197-43 43Zm318 2-43-43 199-199-197-197 43-43 240 240-242 242Z"/>
      </svg>
    `;

    buttonEl.addEventListener("click", () => {
      this.classList.toggle("active");

      if (!this.dialog.open) {
        this.dialog.showModal();
      } else {
        this.dialog.close();
      }
    });

    const wrapper = document.createElement("div");

    const contentEl = document.createElement("div");
    contentEl.classList.add("a");
    // contentEl.innerHTML = children;

    this.dialog = document.createElement("dialog");
    this.dialog.innerHTML = `
        <form>
        <p>
          <label>
            Favorite animal:
            <select>
              <option value="default">Choose…</option>
              <option>Brine shrimp</option>
              <option>Red panda</option>
              <option>Spider monkey</option>
            </select>
          </label>
        </p>
        <div>
          <button value="cancel" formmethod="dialog">Cancel</button>
          <button id="confirmBtn" value="default">Confirm</button>
        </div>
      </form>
    `;

    wrapper.appendChild(buttonEl);
    wrapper.appendChild(contentEl);
    wrapper.appendChild(this.dialog);

    this.appendChild(wrapper);
  }

  setContent(data) {
    // this.dialog.innerHTML =  hljs.highlightAuto(data).value;

    // this.dialog.innerHTML = `<pre><code class="language-sql">create_table test_66(id int(10) auto_increment primary key,
    //   user_id int(10) not null
    // ) engine=innodb charset=utf8;</code></pre>`

    this.dialog.innerHTML = `
        <pre><code class="language-css">p { color: red }</code></pre>
    `;

    //     hljs.highlightAll();

    const code = indent.html(data);
    const modifiedCode = code.replace(/^\s*[\r\n]/gm, "");
    // console.log(modifiedCode);

    // console.log(convertToMultilineWithIndentation(data));

    // Returns a highlighted HTML string
    const html = Prism.highlight(modifiedCode, Prism.languages.html, "html");

    this.dialog.innerHTML =
      '<pre><code class="language-html">' + html + "</code></pre>";
  }
}

customElements.define("sandbox-code", SandboxCode);

class Link extends HTMLElement {
  connectedCallback() {
    const children = this.innerHTML;

    let url = this.getAttribute("to");
    if (location.hostname === "127.0.0.1") {
      url = url.replace("/", url.length > 1 ? "?route=" : "?");
    }

    this.innerHTML = /* html */ `
      <a href="${url}">${children}</a>
    `;
  }
}
customElements.define("a-link", Link);
