export class StaticSceneGfx {
  constructor() {
    this._backSprite = null
    this._container = null
    this._sorted_list = []
    this._component_in_front = null
    this._components = new Map()
    this._isDirty = false
  }

  Build(backTexture, viewWidth, viewHeight) {
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

  set_component(key, comp) {
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
    this._sorted_list.forEach(element => {
      if (element !== this._component_in_front) {
        let c1 = this._components.get(element)
        c1.Render(isDirty)
        if (this._isDirty) {
          this._container.addChild(c1._container)
        }
      }
    });
    if (this._component_in_front) {
      let cf = this._components.get(this._component_in_front)
      cf.Render(isDirty)
      if (this._isDirty) {
        this._container.addChild(c1._container)
      }
    }
    this._isDirty = false
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


