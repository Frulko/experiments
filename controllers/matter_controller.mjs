

export const css = [];
export const js = ['matter/matter.min.js'];
export const globalJS = [];


export const connect = (element, data) => {
  console.log('[matter]', element, data)

  const rect = element.getBoundingClientRect();

  // module aliases
  var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;

  // create an engine
  var engine = Engine.create();

  // create a renderer
  var render = Render.create({
    element,
    engine: engine,
    options: {
      showPerformance: true,
      width: rect.width,
      height: rect.height
    }
  });

  // create two boxes and a ground
  var boxA = Bodies.rectangle(400, 200, 80, 80);
  var boxB = Bodies.rectangle(450, 50, 80, 80);
  var ground = Bodies.rectangle(400, rect.height, 810, 60, { isStatic: true });

  // add all of the bodies to the world
  Composite.add(engine.world, [boxA, boxB, ground]);

  // run the renderer
  Render.run(render);

  // create runner
  var runner = Runner.create();

  // run the engine
  Runner.run(runner, engine);
}

export const disconnect = () => {

}