export default (z_ord) => {
  const _myGraph = new PIXI.Graphics()
  let _sparks = []

  function random(min, max, round) {
    if (round == 'round') {
      return Math.round(Math.random() * (max - min) + min);
    } else {
      return Math.random() * (max - min) + min;
    }
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
      _sparks.push(spark);
    }
    this.s++;
  }

  Particles.prototype.draw = function () {
    _myGraph.save();
    _myGraph.globalAlpha = this.opacity;
    _myGraph.fillStyle = this.color;
    _myGraph.strokeStyle = this.color;

    if (this.type == 1) {
      _myGraph.beginPath();
      _myGraph.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
      _myGraph.fill();
    } else if (this.type == 2) {
      _myGraph.translate(this.x, this.y);
      _myGraph.scale(this.scale, this.scale);
      _myGraph.beginPath();
      _myGraph.fillRect(0, 0, 1, 1);
    } else if (this.type == 3) {
      _myGraph.beginPath();
      _myGraph.moveTo(this.x, this.y);
      _myGraph.lineTo(this.x - this.vx * 10, this.y - this.vy * 10);
      _myGraph.stroke();
    } else if (this.type == 4) {
      _myGraph.beginPath();
      _myGraph.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
      _myGraph.fill();
    } else {
      _myGraph.arc(this.x, this.y, 1, 0, 2 * Math.PI);
      _myGraph.fill();
    }
    _myGraph.closePath();
    _myGraph.restore();
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
    _myGraph.mo
    _myGraph.moveTo(this.x, this.y);
    _myGraph.lineTo(this.tx, this.ty);
    _myGraph.lineWidth = 1;
    _myGraph.strokeStyle = this.color;
    _myGraph.stroke();
  }

  var CompoGfx = function () {
    this.z_ord = z_ord
    this._isDirty = false
    this._container = new PIXI.Container()
  }

  CompoGfx.prototype.Build = function () {
    this._container.addChild(_myGraph);
    this._isDirty = true
    return this._container
  }

  CompoGfx.prototype.Render = function (isDirty, delta) {
    if (this._isDirty || isDirty) {
      console.log('Fireworks is dirty')
    }
    this._isDirty = false
  }

  return new CompoGfx()
}
