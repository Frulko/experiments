import TestClass from './test/TestClass.js';

export const css = ['test/test_controller.css'];
export const js = [];

export const connect = (element, data) => {
  const t = new TestClass();
  console.log('[test]', element, data)
  element.innerHTML = `<h2>${data.text}</h2>`
}

export const disconnect = () => {
  console.log('test controller disconnected')
}