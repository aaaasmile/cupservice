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
    //console.log('Ratio win - sprite', viewratio, spratio)
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
  },
  CalcSpriteVelocity(sprite, step_target) {
    const endpoint_x = sprite.end_x
    const endpoint_y = sprite.end_y
    const x0 = sprite.x
    const y0 = sprite.y
    let iq = 0, im = 0, v_estimated = 1
    if (!step_target) {
      throw (new Error('Animation step could not be zero'))
    }
    if (Math.abs(endpoint_x - x0) > Math.abs(endpoint_y - y0)) {
      //we are moving on x axis
      sprite.m_type = 'x_axis'
      if (endpoint_x - x0 !== 0) {
        im = (endpoint_y - y0) * 1000 / (endpoint_x - x0)
        v_estimated = (endpoint_x - x0) / step_target
      }
      iq = y0 - im * x0 / 1000
    }
    else {
      // we are moving on y axis
      sprite.m_type = 'y_axis'
      if (endpoint_y - y0 != 0) {
        im = (endpoint_x - x0) * 1000 / (endpoint_y - y0)
        v_estimated = (endpoint_y - y0) / step_target
      }
      iq = x0 - im * y0 / 1000
    }

    //velocity
    sprite.vx = v_estimated
    sprite.vy = v_estimated
    sprite.vel_im = im
    sprite.vel_iq = iq

    return sprite
  }
}