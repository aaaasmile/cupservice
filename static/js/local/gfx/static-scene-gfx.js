import Helper from '../shared/helper.js'

export class StaticSceneGfx {
  constructor() {
    this._backSprite = null
    this._container = null
    this._sorted_list = []
    this._component_in_front = null
    this._components = new Map()
    this._isDirty = false
    this._canvas_h = 0
    this._canvas_w = 0
    this._animations = []
    this._aniFinalNfy = []
  }

  Build(backTexture, viewWidth, viewHeight) {
    this._canvas_h = viewHeight
    this._canvas_w = viewWidth
    this._backSprite = new PIXI.Sprite(backTexture)
    this._container = new PIXI.Container()
    this._container.addChild(this._backSprite)
    Helper.ScaleSprite(this._backSprite, viewWidth, viewHeight)

    return this._container
  }

  SetFrontComponent(comp_name){
    this._component_in_front = comp_name
  }

  AddMarker(nameMarker, comp) {
    const key = 'MKR-' + nameMarker
    this.set_component(key, comp)
  }

  RemoveMarker(nameMarker) {
    const key = 'MKR-' + nameMarker
    this.clear_component(key)
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

  clear_component(key) {
    if (this._components.has(key)) {
      this._components.delete(key)
      this._isDirty = true
    }
  }

  clear_all_components() {
    this._components = new Map()
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
    //console.log('*** sorted keys: ', sortedKeys)
    sortedKeys.forEach(element => {
      list.push(element)
    });
    this._sorted_list = list
  }

  AddAnimation(ani) {
    this._animations.push(ani)
  }

  AddFinalNtfy(ntfy) {
    this._aniFinalNfy.push(ntfy)
  }

  UpdateAnimations(isDirty, delta) {
    if (this._isDirty || isDirty) {
      // static scene should be ready before render animations
      return
    }
    if (this._aniFinalNfy.length > 0) {
      this._aniFinalNfy.forEach(ntfy => {
        ntfy()
        this._aniFinalNfy.splice(ntfy)
      })
    }

    if (this._animations.length === 0) {
      return
    }

    this._animations.forEach(ani => {
      if (ani.CheckForStart()) {
        const compKey = ani.get_start_comp()
        if (compKey) {
          const comp = this.get_component(compKey)
          const spritesArr = comp.set_animation_sprite_start(ani.name(), ani.data())

          spritesArr.forEach(sprite => {
            const compStopKey = ani.get_stop_comp()
            if (compStopKey) {
              const compStop = this.get_component(compStopKey)
              compStop.set_animation_sprite_target(ani.name(), sprite, ani.data(), this._canvas_w, this._canvas_h)
            } else {
              throw (new Error('Target component is not set'))
            }
            //console.log('add sprite ', sprite)
            ani.add_sprite(sprite)
          });
        }
        this._container.addChild(ani.get_container())
        ani.started()
      }
      ani.Update(delta)
      if (ani.is_terminated()) {
        this._animations.splice(ani)
        ani.completed()
      }
    });
  }

  Render(isDirty, delta) {
    if (this._isDirty) {
      //console.log('*** rebuild the scene')
      this._container.removeChildren()
      this._container.addChild(this._backSprite)
    }
    let built_comp = []
    // render components
    this._sorted_list.forEach(element => {
      if (element !== this._component_in_front) {
        let c1 = this._components.get(element)
        c1.Render(isDirty, delta)
        if (this._isDirty) {
          this._container.addChild(c1._container)
          built_comp.push(c1)
        }
      }
    });
    if (this._component_in_front) {
      let cf = this._components.get(this._component_in_front)
      cf.Render(isDirty, delta)
      if (this._isDirty) {
        this._container.addChild(cf._container)
        built_comp.push(cf)
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
      return [0, 0, this._canvas_w, this._canvas_h]
    }
    let c1 = this._components.get(anchor_element)
    if (c1) {
      return [c1._container.position.x, c1._container.position.y, c1._container.width, c1._container.height]
    }

    throw (new Error(`anchor_element => ${anchor_element} not found.`))
  }

}

///////////////////////////////////////////////////////////


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
    case 'bottom_anchor_rel':
      calc_pos = anch_pos_y + anch_h + info_pos.offset
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


