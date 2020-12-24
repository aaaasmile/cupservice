export default {
  MinOnWeightItem1(w_cards) {
    // expects something like this:
    // let w_cards = [
    //   ['ab', 2],
    //   ['fs', 1],
    //   ['rs', 4],
    //   ['rc', 12]
    // ];
    // and returns ['fs', 1]
    let min_ele = Math.min.apply(Math, w_cards.map(function (o) {
      return o[1];
    }));
    let min_obj = w_cards.filter(function (o) { return o[1] === min_ele; })[0];
    return min_obj;
  },
  ScaleSprite(sprite, viewWidth, viewHeight) {
    let viewratio = viewWidth / viewHeight
    let spratio = sprite.width / sprite.height
    console.log('Ratio win - sprite', viewratio, spratio)
    let scale = 1
    let pos = new PIXI.Point(0, 0)
    if (viewratio > spratio) {
      scale = viewWidth / sprite.width
      pos.y = (viewHeight - sprite.height * scale) / 2
    } else {
      scale = viewHeight / sprite.height
      pos.x = (viewWidth - sprite.width * scale) / 2
    }
    sprite.scale.set(scale, scale)
    sprite.position = pos
  }
}