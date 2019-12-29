import * as Matter from "matter-js";

// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Constraint = Matter.Constraint,
  Body = Matter.Body;

const SHOW_HIDDEN = false;
const LEFT = 1;
const RIGHT = -1;

const COLOR = {
  PADDLE: "#e64980",
  BUMPER: "#15aabf",
  HIDDEN: "#00FF00",
  CIRCLE: "#fab005",
  CIRCLE_LIT: "#FFFFFF"
};

// create an engine
var engine = Engine.create();
engine.world.bounds = {
  min: { x: 0, y: 0 },
  max: { x: 600, y: 700 }
};

engine.world.gravity.y = 0.75;

// create a renderer
var render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: engine.world.bounds.max.x,
    height: engine.world.bounds.max.y,
    showCollisions: false,
    wireframes: false
  }
});

// create two boxes and a ground
let paddleGroup = Body.nextGroup(true);
const PADDLE_CATEGORY = Body.nextCategory();

const createPaddle = (x, y, dir, key, label) => {
  const paddle = Bodies.trapezoid(x, y, 20, 100, 0.33, {
    angle: (dir * 90 * Math.PI) / 180,
    chamfer: {},
    render: { fillStyle: COLOR.PADDLE },
    collisionFilter: { mask: 0 }
  });
  const paddleBrick = Bodies.rectangle(x + 2 * dir, y + 12, 40, 100, {
    angle: (dir * 93 * Math.PI) / 180,
    render: { visible: SHOW_HIDDEN, fillStyle: COLOR.HIDDEN },
    collisionFilter: { category: PADDLE_CATEGORY, group: paddleGroup }
  });
  const paddleComp = Body.create({
    parts: [paddle, paddleBrick],
    collisionFilter: { category: PADDLE_CATEGORY, group: paddleGroup }
  });
  const paddleHinge = Bodies.circle(x - dir * 35, y, 2, {
    collisionFilter: { group: paddleGroup },
    isStatic: true
  });
  const paddleHingeConstraint = Constraint.create({
    bodyA: paddleComp,
    bodyB: paddleHinge,
    pointA: {
      x: -1 * dir * 38,
      y: -9
    },
    length: 0
  });
  const stopperFilter = { mask: PADDLE_CATEGORY };
  const paddlePowerBlock = Bodies.circle(x, y - 100, 2, {
    isStatic: true,
    render: { visible: SHOW_HIDDEN, fillStyle: COLOR.HIDDEN },
    collisionFilter: stopperFilter
  });
  const id = label + "paddle";
  const paddleConstraintOptions = {
    bodyA: paddleComp,
    bodyB: paddlePowerBlock,
    pointA: { x: dir * 35, y: -15 },
    length: 70,
    stiffness: 0.035,
    damping: 0.1,
    render: { visible: SHOW_HIDDEN },
    id
  };
  const paddlePowerConstraint = Constraint.create(paddleConstraintOptions);
  const stopperOptions = {
    isStatic: true,
    render: { visible: SHOW_HIDDEN, fillStyle: COLOR.HIDDEN },
    collisionFilter: stopperFilter
  };
  const paddleStopper = Bodies.circle(x + dir * 10, y + 60, 2, stopperOptions);
  const paddleStopper2 = Bodies.circle(
    x + dir * 20,
    y - 60,
    30,
    stopperOptions
  );
  document.addEventListener("keydown", function(e) {
    if (e.which === key) {
      const constraint = Matter.Composite.get(engine.world, id, "constraint");
      if (!constraint) {
        World.add(engine.world, paddlePowerConstraint);
      }
    }
  });

  document.addEventListener("keyup", function(e) {
    if (e.which === key) {
      World.remove(engine.world, paddlePowerConstraint);
    }
  });

  World.add(engine.world, [
    paddleComp,
    paddleHinge,
    paddleHingeConstraint,
    paddlePowerBlock,
    paddleStopper,
    paddleStopper2
  ]);
};

const createWalls = () => {
  const wallOptions = { isStatic: true };
  const leftWall = Bodies.rectangle(
    10,
    engine.world.bounds.max.y / 2,
    20,
    engine.world.bounds.max.y,
    wallOptions
  );
  const rightWall = Bodies.rectangle(
    engine.world.bounds.max.x - 10,
    engine.world.bounds.max.y / 2,
    20,
    engine.world.bounds.max.y,
    wallOptions
  );
  const topWall = Bodies.rectangle(
    engine.world.bounds.max.x / 2,
    10,
    engine.world.bounds.max.x,
    20,
    wallOptions
  );
  leftWall.restitution = 0.4;
  rightWall.restitution = 0.4;

  World.add(engine.world, [leftWall, rightWall, topWall]);
};

const createBumpers = () => {
  const bumperConfig = {
    chamfer: { radius: 12 },
    isStatic: true,
    render: {
      fillStyle: COLOR.BUMPER
    },
    angle: (45 * Math.PI) / 180
  };
  const leftBumper = Bodies.trapezoid(
    115,
    550,
    100,
    50,
    (-37 * Math.PI) / 180,
    bumperConfig
  );
  const rightBumper = Bodies.trapezoid(
    485,
    550,
    100,
    50,
    (-37 * Math.PI) / 180,
    {
      ...bumperConfig,
      angle: (-45 * Math.PI) / 180,
      chamfer: { radius: 12 }
    }
  );
  leftBumper.restitution = 1.6;
  rightBumper.restitution = 1.6;

  const leftBlocker = Bodies.trapezoid(40, 360, 150, 50, (45 * Math.PI) / 180, {
    ...bumperConfig,
    angle: Math.PI / 2,
    chamfer: { radius: 12 }
  });
  const rightBlocker = Bodies.trapezoid(
    engine.world.bounds.max.x - 40,
    360,
    150,
    50,
    (45 * Math.PI) / 180,
    {
      ...bumperConfig,
      angle: -Math.PI / 2,
      chamfer: { radius: 12 }
    }
  );
  World.add(engine.world, [leftBumper, rightBumper, leftBlocker, rightBlocker]);
};

const createCircles = specs => {
  for (const pt of specs) {
    const circle = Bodies.circle(pt.x, pt.y, 40, {
      label: "circle",
      isStatic: true,
      render: {
        fillStyle: COLOR.CIRCLE
      }
    });
    circle.restitution = 1.2;
    World.add(engine.world, [circle]);
  }
};

createPaddle(230, 600, LEFT, 37, "left");
createPaddle(370, 600, RIGHT, 39, "right");
const ball = Bodies.circle(300, 100, 20, {
  inertia: 1000,
  friction: 0,
  label: "pinball"
});
const bottom = Bodies.rectangle(300, 695, 600, 10, {
  isStatic: true,
  label: "bottom",
  render: { visible: SHOW_HIDDEN }
});
bottom.label = "bottom";
World.add(engine.world, [ball, bottom]);
createWalls();
createBumpers();
createCircles([
  { x: 150, y: 200 },
  { x: engine.world.bounds.max.x - 150, y: 200 },
  { x: 225, y: 325 },
  { x: engine.world.bounds.max.x - 225, y: 325 }
]);

const resetBall = () => {
  Body.setPosition(ball, { x: 250, y: 100 });
  Body.setAngularVelocity(ball, 0);
};

const hitCircle = circle => {
  // flash color
  circle.render.fillStyle = COLOR.CIRCLE_LIT;
  setTimeout(function() {
    circle.render.fillStyle = COLOR.CIRCLE;
  }, 100);
};

Matter.Events.on(engine, "collisionStart", function(event) {
  let pairs = event.pairs;
  pairs.forEach(function(pair) {
    if (pair.bodyB.label === "pinball") {
      if (pair.bodyA.label === "bottom") {
        resetBall();
      } else if (pair.bodyA.label === "circle") {
        hitCircle(pair.bodyA);
      }
    } else if (pair.bodyB.label === "bottom") {
      if (pair.bodyA.label === "pinball") {
        resetBall();
      }
    } else if (pair.bodyB.label === "circle") {
      if (pair.bodyA.label === "pinball") {
        hitCircle(pair.bodyB);
      }
    }
  });
});

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);
