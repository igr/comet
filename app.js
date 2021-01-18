function ready(callback) {
  if (document.readyState !== 'loading') callback();
  else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
  else document.attachEvent('onreadystatechange', function () {
      if (document.readyState === 'complete') callback();
    });
}

function random(n) {
  return Math.floor(Math.random() * n);
}

////////////////////////////////////////////////////////////////////////////////

const app = new PIXI.Application({
	autoResize: true,
  backgroundColor: 0x000,
  resolution: devicePixelRatio,
  resizeTo: window,
  antialias: true
});
const container = new PIXI.Container();
app.stage.addChild(container);

const g = new PIXI.Graphics();
//container.addChild(g);
const starTexture = PIXI.Texture.from('star_small.png');
const cometTexture = PIXI.Texture.from('star.png');
const haloTexture = PIXI.Texture.from('halo.png');
const flameTexture = PIXI.Texture.from('particle.png');

// create the stars
let radius;
let w;
let h;
let x;
let y;

const comet = new PIXI.Sprite(cometTexture);
const halo = new PIXI.Sprite(haloTexture);
const starAmount = 100;
const stars = [];

function setupStars() {
  for (let i = 0; i < starAmount; i++) {
    const star = {
      sprite: new PIXI.Sprite(starTexture),
      z: 0,
      x: -radius + random(radius * 2),
      y: -radius + random(radius * 2),
      v: 1 + random(10)
    };
    star.sprite.width = 5 + random(10);
    star.sprite.height = star.sprite.width;
    star.sprite.anchor.x = 0.5;
    star.sprite.anchor.y = 0.7;
    star.sprite.alpha = Math.random();
    container.addChild(star.sprite);
    stars.push(star);
  }
}

// create flames

const flameAmount = 1000;
const flames = [];

function setupFlames() {
  for (let i = 0; i < flameAmount; i++) {
    const distance = random(radius);
    const alpha = -10 + random(20);
    const t = {
      cosAlpha: Math.cos(alpha*3.14/180),
      sinBeta: Math.sin((45-alpha)*3.14/180),
      cosBeta: Math.cos((45-alpha)*3.14/180),
    };
    const hipotenuza = distance * t.cosAlpha;
    const dx = hipotenuza * t.sinBeta;
    const dy = hipotenuza * t.cosBeta;

    const flame = {
      sprite: new PIXI.Sprite(flameTexture),
      v: 10 + random(5),
      t: t,
      d: distance
    };
    flame.sprite.width = 10;
    flame.sprite.height = 10;

    container.addChild(flame.sprite);
    flames.push(flame);
  }
}

function resize() {
	app.renderer.resize(window.innerWidth, window.innerHeight);
  w = app.screen.width;
  h = app.screen.height;
  x = w/2;
  y = h/2;

  radius = Math.min(w, h) * 0.4;
}

ready(() => {
  document.body.appendChild(app.view);
  window.addEventListener("resize", resize);
});

function setup() {
  resize();
  setupStars();
  setupFlames();
  container.addChild(comet);
  container.addChild(halo);
  g.beginFill(0xe74c3c);
  g.drawCircle(x, y, radius);
  g.endFill();

  let tick = 0;
  app.ticker.add((delta) => {
    tick = tick + 1;
    const updown = Math.sin(tick/50) * 6;

    comet.x = x - comet.width / 2 + updown;
    comet.y = y - comet.width / 2 + updown;

    halo.x = x - halo.width / 2;
    halo.y = y - halo.width / 2;
    halo.alpha = 0.8 + random(20)/100;

    stars.forEach(star => {
      star.x = star.x + star.v;
      star.y = star.y + star.v;
      star.sprite.x = x + star.x;
      star.sprite.y = y + star.y;

      const deltaX = star.x;
      const deltaY = star.y;
      let distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
      let distanceRatio = distance/radius;
      star.sprite.alpha = 1 - distanceRatio;

      if (star.x > radius) {
        star.x = -radius;
      }
      if (star.y > radius) {
        star.y = -radius;
      }
    });

    flames.forEach(flame => {
      flame.d = flame.d + flame.v;

      const hipotenuza = flame.d * flame.t.cosAlpha;
      const dx = hipotenuza * flame.t.sinBeta;
      const dy = hipotenuza * flame.t.cosBeta;

      flame.sprite.x = x + dx + random(10);
      flame.sprite.y = y + dy + random(10);

      let distance = flame.d;
      let distanceRatio = distance/radius;

      flame.sprite.alpha = 1 - distanceRatio;
      flame.sprite.width = 10 + 16 * distanceRatio;
      flame.sprite.height = 10 + 16 * distanceRatio;

      if (distance > radius + 40) {
        flame.d = 0;
        flame.sprite.width = 10;
        flame.sprite.height = 10;
      }
    });
  });
}

PIXI.Loader.shared.load(setup);
