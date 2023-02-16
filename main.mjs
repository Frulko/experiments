
console.log('-here');

document.querySelectorAll('*[data-controller]').forEach((el) => {
  const controllerPath = './controllers/';
  const controllerName = el.getAttribute('data-controller');
  const fullModuleName = `${controllerPath}${controllerName}_controller.mjs`;

  import(fullModuleName).then(async (m) => {
    
    if (m.css) {
      m.css.map((file) => `${controllerPath}${file}`).forEach((file) => loadCSS(file, controllerName));
    }

    if(m.js) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
      for (let i = 0; i < m.js.length; i++) {
        const file = m.js[i];
        await loadJS(`${controllerPath}${file}`, controllerName);
      }
    }

    m.connect(el, getDataFromElementAttributes(el));
  }).catch((err) => {
    console.error(err);
  })
})


const parseAttributeValue = (inputValue) => {
  let outputValue = /^\d+$/.test(inputValue) ? +inputValue: inputValue;
  switch (inputValue) {
    case 'true':
      outputValue = true;
      break;
    case 'false':
      outputValue = false;
        break;
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

const loadCSS = (path, moduleName) => {
  const identifier = `style_${moduleName}`;
  if (document.getElementById(identifier)) {
    return; //skip already loaded
  }
  const styleEl = document.createElement('link');
  styleEl.id = identifier
  styleEl.setAttribute('href', path)
  styleEl.setAttribute('rel', 'stylesheet')

  document.querySelector('head').appendChild(styleEl);
}

const loadJS = (path, moduleName) => {
  const identifier = `script_${moduleName}`;

  // issue need a global loading scripts references for resolving only when script is loaded even if multiple controller need it
  if (document.getElementById(identifier)) {
    return new Promise((resolve) => resolve()); //skip already loaded
  }

  const scriptEl = document.createElement('script');
  scriptEl.id = identifier
  scriptEl.setAttribute('src', path)
  scriptEl.setAttribute('type', 'application/javascript')

  document.querySelector('body').appendChild(scriptEl);

  return new Promise((resolve, reject) => {
    scriptEl.onload = resolve
    scriptEl.onerror = reject
  })
}

/**
 * Maybe need a compiler like webpack or vite or esbuild
 * output a manifest file (js, json ?) with the name for each controller for importing
 * the benefit of using a bundler is to have one js file with all project
 * how to share utils ? the script embed is local to a controller/module
 */