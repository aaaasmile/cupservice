
// Sparkler = function () {
//   this.x = 0;
//   this.y = 0;
//   this.tx = 0;
//   this.ty = 0;
//   this.limit = 0;
//   this.color = 'red';

//   this.update = function () {
//     this.tx += this.vx;
//     this.ty += this.vy;

//     this.limit--;
//   }

//   this.draw = function () {
//     ctx.beginPath();
//     ctx.moveTo(this.x, this.y);
//     ctx.lineTo(this.tx, this.ty);
//     ctx.lineWidth = 1;
//     ctx.strokeStyle = this.color;
//     ctx.stroke();
//     ctx.closePath();
//   }
// }


export default (z_ord) => {
  const _z_ord = z_ord
  const _container = new PIXI.Container()
  const _mode_display = 'normal'
  let _isDirty = false
  // var Compo = function () {
  //   this.z_ord = z_ord
  // }
  // Compo.prototype.Build = function () {
  //   _myGraph = new PIXI.Graphics();
  //   _container.addChild(this._myGraph);
  //   _isDirty = true
  //   return _container
  // }
  // return new Compo()
  return {
    Build() {

    },
    Render(isDirty, delta) {
      if (this._isDirty || isDirty) {
      }
      this._isDirty = false
    }
  }
}
