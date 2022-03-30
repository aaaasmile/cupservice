export default (z_ord) => {
  const g_myGraph = new PIXI.Graphics()
  let g_sparks = []
  let g_particles = []
  let g_fireworks = []
  let g_timer = 0
  let g_colorchanger = 0
  let g_typecount = 1

  function random(min, max, round) {
    if (round == 'round') {
      return Math.round(Math.random() * (max - min) + min);
    } else {
      return Math.random() * (max - min) + min;
    }
  }

  function colors() {
    let num = 1
    if (g_timer > g_colorchanger) {
      num = random(0, 7, 'round');
      g_colorchanger = g_timer + (500);
    }
    switch (num) {
      case 1: return '#ff0000'; break;
      case 2: return '#ffff00'; break;
      case 3: return '#00ff00'; break;
      case 4: return '#00ffff'; break;
      case 5: return '#0000ff'; break;
      case 6: return '#ff00ff'; break;
      case 7: return '#ffac00'; break;
    }
  }

  function getAngle(posx1, posy1, posx2, posy2) {
    if (posx1 == posx2) { if (posy1 > posy2) { return 90; } else { return 270; } }
    if (posy1 == posy2) { if (posy1 > posy2) { return 0; } else { return 180; } }

    var xDist = posx1 - posx2;
    var yDist = posy1 - posy2;

    if (xDist == yDist) { if (posx1 < posx2) { return 225; } else { return 45; } }
    if (-xDist == yDist) { if (posx1 < posx2) { return 135; } else { return 315; } }

    if (posx1 < posx2) {
      return Math.atan2(posy2 - posy1, posx2 - posx1) * (180 / Math.PI) + 180;
    } else {
      return Math.atan2(posy2 - posy1, posx2 - posx1) * (180 / Math.PI) + 180;
    }
  }

  function distance(px1, py1, px2, py2) {
    const xdis = px1 - px2;
    const ydis = py1 - py2;
    return Math.sqrt((xdis * xdis) + (ydis * ydis));
  }

  function createParticles(type, count, pox, poy, color) {
    console.log('create particles: ', type, count, pox, poy, color)
    for (var i = 0; i < count; i++) {
      let par = new Particles();
      par.type = type;

      par.color = color;
      par.x = pox;
      par.y = poy;

      var angle = random(0, 360);
      par.vx = Math.cos(angle * Math.PI / 180.0);
      par.vy = Math.sin(angle * Math.PI / 180.0);

      g_particles.push(par);
    };
  }

  var Firework = function () {
    this.x = 0;
    this.y = 0;
    this.sx = 0;
    this.sy = 0;
    this.tx = 0;
    this.ty = 0;
    this.vx = 0;
    this.vy = 0;
    this.color = 'rgb(255,255,255)';
    this.dis = distance(this.sx, this.sy, this.tx, this.ty);
    this.speed = random(700, 1100);
    this.gravity = 1.5;
    this.ms = 0;
    this.s = 0;
    this.del = false;
  }

  Firework.prototype.update = function (ms) {
    this.ms = ms / 1000;

    if (this.s > 2000 / ms) {
      createParticles(g_typecount, 30, this.x, this.y, this.color);
      this.del = true;
    } else {
      this.speed *= 0.98;
      this.x -= this.vx * this.speed * this.ms;
      this.y -= this.vy * this.speed * this.ms - this.gravity;
    }

    this.s++;
  }

  Firework.prototype.draw = function () {
    // g_myGraph.fillStyle = this.color;
    // g_myGraph.arc(this.x, this.y, 1, 0, 2 * Math.PI);
    //g_myGraph.beginFill(0xDE3249);
    // g_myGraph.drawRect(50, 50, 100, 100);
    //g_myGraph.endFill();
    g_myGraph.lineStyle(1, 0x3333DD, 1);
    g_myGraph.arc(this.x, this.y, 1, 0, 2 * Math.PI);
    //g_myGraph.arc(650, 270, 60, 2 * Math.PI, 3 * Math.PI / 2);
    
  }

  var Particles = function () {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = random(200, 500);
    this.gravity = 1;
    this.wind = 0;
    this.type = 1;
    this.opacity = 1;
    this.s = 0;
    this.scale = 1;
    this.color = '#FFF';
    this.del = false;
  }

  Particles.prototype.update = function (ms) {
    this.ms = ms / 1000;
    if (this.s > 900 / ms) { if (this.opacity - 0.05 < 0) { this.opacity = 0; } else { this.opacity -= 0.05; } }

    if (this.type == 1) {
      this.speed *= 0.96;
      this.x -= this.vx * this.speed * this.ms + this.wind;
      this.y -= this.vy * this.speed * this.ms - this.gravity;
    } else if (this.type == 2) {
      if (this.s < 800 / ms) { this.scale += 0.1; } else { this.scale -= 0.2; }
      this.speed *= 0.96;
      this.x -= this.vx * this.speed * this.ms + this.wind;
      this.y -= this.vy * this.speed * this.ms - this.gravity;
    } else if (this.type == 3) {
      this.speed *= 0.95;
      this.x -= this.vx * this.speed * this.ms + this.wind;
      this.y -= this.vy * this.speed * this.ms;
    } else if (this.type == 4) {
      this.speed *= 0.96;
      this.x -= this.vx * this.speed * this.ms + this.wind;
      this.y -= this.vy * this.speed * this.ms - this.gravity;

      spark = new Sparkler();
      spark.x = this.x;
      spark.y = this.y;
      spark.vx = Math.cos(random(0, 360, 'round') * (Math.PI / 180)) * 1.05;
      spark.vy = Math.sin(random(0, 360, 'round') * (Math.PI / 180)) * 1.05;
      spark.tx = this.x;
      spark.ty = this.y;
      spark.color = this.color;
      spark.limit = random(4, 10, 'round');
      g_sparks.push(spark);
    }
    this.s++;
  }

  Particles.prototype.draw = function () {
    //g_myGraph.save();
    g_myGraph.globalAlpha = this.opacity;
    g_myGraph.fillStyle = this.color;
    g_myGraph.strokeStyle = this.color;

    if (this.type == 1) {
      //g_graphics.beginFill(this.color);
      g_myGraph.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
      //g_graphics.endFill();
    } else if (this.type == 2) {
      g_myGraph.translate(this.x, this.y);
      g_myGraph.scale(this.scale, this.scale);
      g_myGraph.fillRect(0, 0, 1, 1);
    } else if (this.type == 3) {
      g_myGraph.moveTo(this.x, this.y);
      g_myGraph.lineTo(this.x - this.vx * 10, this.y - this.vy * 10);
      g_myGraph.stroke();
    } else if (this.type == 4) {
      g_myGraph.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
    } else {
      g_myGraph.arc(this.x, this.y, 1, 0, 2 * Math.PI);
    }
    g_myGraph.closePath();
    //g_myGraph.restore();
  }

  var Sparkler = function () {
    this.x = 0;
    this.y = 0;
    this.tx = 0;
    this.ty = 0;
    this.limit = 0;
    this.color = 'red';
  }

  Sparkler.prototype.update = function () {
    this.tx += this.vx;
    this.ty += this.vy;
    this.limit--;
  }

  Sparkler.prototype.draw = function () {
    g_myGraph.moveTo(this.x, this.y);
    g_myGraph.lineTo(this.tx, this.ty);
    g_myGraph.lineWidth = 1;
    g_myGraph.strokeStyle = this.color;
    g_myGraph.stroke();
  }

  var CompoGfx = function () {
    this.z_ord = z_ord
    this._canvas_w = 0
    this._canvas_h = 0
    this._limiterTicker = 0
    this._timedFirework = 120
    this._isDirty = false
    this._started = false
    this._container = new PIXI.Container()
  }

  CompoGfx.prototype.Build = function () {
    this._container.addChild(g_myGraph);
    this._isDirty = false
    return this._container
  }

  CompoGfx.prototype.Start = function (canvas_h, canvas_w) {
    g_sparks = []
    g_particles = []
    g_fireworks = []

    this._canvas_w = canvas_w
    this._canvas_h = canvas_h
    this._started = true
    this._isDirty = true
    this.createFirework()
  }

  CompoGfx.prototype.createFirework = function () {
    console.log('create firework')
    let x = 0
    let y = 0; // start points could be customizable (e.g. mouse click on x,y)
    let firework = new Firework();

    firework.x = firework.sx = this._canvas_w / 2;
    firework.y = firework.sy = this._canvas_h;

    firework.color = colors();

    if (x != 0 && y != 0) {
      firework.tx = x;
      firework.ty = y;
      x = y = 0;
    } else {
      firework.tx = random(400, this._canvas_w - 400);
      firework.ty = random(0, this._canvas_h / 2);
    }

    var angle = getAngle(firework.sx, firework.sy, firework.tx, firework.ty);

    firework.vx = Math.cos(angle * Math.PI / 180.0);
    firework.vy = Math.sin(angle * Math.PI / 180.0);

    g_fireworks.push(firework);
  }

  CompoGfx.prototype.Render = function (isDirty, delta) {
    //console.log('Fireworks is Render...') // function called each update (60fps)
    if (this._isDirty || isDirty) {
      console.log('Fireworks is dirty')
    }
    this._isDirty = false
    if (!this._started) {
      return
    }
    
    g_myGraph.globalAlpha = 1;
		g_myGraph.beginFill('rgba(0, 0, 0, 0.15)');
		g_myGraph.drawRect(0, 0, this._canvas_w, this._canvas_h);
    g_myGraph.endFill();

    if (g_timer > this._limiterTicker) {
      this.createFirework();
      this._limiterTicker = g_timer + (this._timedFirework / delta);
    }

    var i = g_fireworks.length;
    while (i--) {
      if (g_fireworks[i].del === true) {
        g_fireworks.splice(i, 1);
      } else {
        g_fireworks[i].update(delta);
        g_fireworks[i].draw();
      }
    }

    i = g_particles.length;
    while (i--) {
      if (g_particles[i].opacity == 0) {
        g_particles.splice(i, 1);
      } else {
        g_particles[i].update(delta);
        g_particles[i].draw();
      }
    }

    i = g_sparks.length;
    while (i--) {
      if (g_sparks[i].limit < 0) {
        g_sparks.splice(i, 1);
      } else {
        g_sparks[i].update(delta);
        g_sparks[i].draw();
      }
    }
    g_timer++;
  }

  return new CompoGfx()
}
