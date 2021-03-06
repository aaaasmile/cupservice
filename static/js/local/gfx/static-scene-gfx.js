export class StaticSceneGfx {
  constructor() {
    this._backSprite = null
    this._container = null
    this._sorted_list = []
    this._component_in_front = null
    this._components = new Map()
    this._isDirty = false
    this.canvas_h = 0
    this.canvas_w = 0
  }

  Build(backTexture, viewWidth, viewHeight) {
    this.canvas_h = viewHeight
    this.canvas_w = viewWidth
    this._backSprite = new PIXI.Sprite(backTexture)
    this._container = new PIXI.Container()
    this._container.addChild(this._backSprite)
    ScaleSprite(this._backSprite, viewWidth, viewHeight)

    return this._container
  }

  AddMarker(nameMarker, comp) {
    const key = 'MKR-' + nameMarker
    this.set_component(key, comp)
  }

  GetMarker(nameMarker) {
    const key = 'MKR-' + nameMarker
    return this.get_component(key)
  }

  AddGfxComponent(key, comp) {
    this.set_component(key, comp)
  }

  set_component(key, comp) {
    if (this._components.has(key)) {
      throw new Error("Component already set", key)
    }
    this._components.set(key, comp)
    this.update_z_order()
    this._isDirty = true
  }

  get_component(key) {
    if (this._components.has(key)) {
      return this._components.get(key)
    }
    throw new Error("Component not found", key)
  }

  update_z_order() {
    //let list = Array.from(this._components.values())
    let list = []
    let listKeys = Array.from(this._components.keys())
    let mm = this._components
    let sortedKeys = listKeys.sort((k1, k2) => {
      let c1 = mm.get(k1)
      let c2 = mm.get(k2)
      if (c1.z_ord > c2.z_ord) {
        return -1
      } else if (c1.z_ord === c2.z_ord) {
        return 0
      }
      return 1
    })
    console.log('*** sorted keys: ', sortedKeys)
    sortedKeys.forEach(element => {
      list.push(element)
    });
    this._sorted_list = list
  }

  Render(isDirty) {
    if (this._isDirty) {
      console.log('*** rebuild the scene')
      this._container.removeChildren()
      this._container.addChild(this._backSprite)
    }
    let built_comp = []
    // render components
    this._sorted_list.forEach(element => {
      if (element !== this._component_in_front) {
        let c1 = this._components.get(element)
        c1.Render(isDirty)
        if (this._isDirty) {
          this._container.addChild(c1._container)
          built_comp.push(c1)
        }
      }
    });
    if (this._component_in_front) {
      let cf = this._components.get(this._component_in_front)
      cf.Render(isDirty)
      if (this._isDirty) {
        this._container.addChild(c1._container)
        built_comp.push(c1)
      }
    }

    // update component position
    for (let index = 0; index < built_comp.length; index++) {
      const compB = built_comp[index];
      if (compB._infoGfx) {
        let [anch_pos_x, anch_pos_y, anch_w, anch_h] = this.get_anch_comp_info(compB._infoGfx.anchor_element)
        const item_w = compB._container.width
        const item_h = compB._container.height
        const pos_x = calc_off_pos(compB._infoGfx.x, anch_pos_x, anch_pos_y, anch_w, anch_h, item_w, item_h)
        const pos_y = calc_off_pos(compB._infoGfx.y, anch_pos_x, anch_pos_y, anch_w, anch_h, item_w, item_h)
        compB._container.position.set(pos_x, pos_y)
      }
    }


    this._isDirty = false
  }// end Render

  get_anch_comp_info(anchor_element) {
    if (anchor_element === 'canvas') {
      return [0, 0, this.canvas_w, this.canvas_h]
    }
    let c1 = this._components.get(this._components)
    if (c1) {
      return [c1._container.position.x, c1._container.position.y, c1._container.width, c1._container.height]
    }

    throw (new Error(`anchor_element => ${anchor_element} not found.`))
  }

}

///////////////////////////////////////////////////////////

function ScaleSprite(sprite, viewWidth, viewHeight) {
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

//info_pos:  {type: 'left_anchor', offset: 10}
function calc_off_pos(info_pos, anch_pos_x, anch_pos_y, anch_w, anch_h, item_w, item_h) {
  let calc_pos = 0
  switch (info_pos.type) {
    case 'left_anchor':
      calc_pos = anch_pos_x + info_pos.offset
      break
    case 'right_anchor':
      calc_pos = anch_pos_x + anch_w - item_w + info_pos.offset
      break
    case 'bottom_anchor':
      calc_pos = anch_pos_y + anch_h - item_h + info_pos.offset
      break
    case 'top_anchor':
      calc_pos = anch_pos_y + info_pos.offset
      break
    case 'center_anchor_horiz':
      calc_pos = anch_pos_x + anch_w / 2 - item_w / 2 + info_pos.offset
      break
    case 'center_anchor_vert':
      calc_pos = anch_pos_y + anch_h / 2 - item_h / 2 + info_pos.offset
      break
    default:
      throw (new Error(`info_pos.type => ${info_pos.type} not recognized.`))
  }
  return calc_pos
}


