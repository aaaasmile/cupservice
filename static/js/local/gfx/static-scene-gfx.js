export class StaticSceneGfx {
  constructor() {
    this._backSprite = null
    this._container = null
    this._sorted_list = []
    this._component_in_front = null
    this._components = new Map()
  }

  Build(backTexture, viewWidth, viewHeight) {
    this._backSprite = new PIXI.Sprite(backTexture)
    this._container = new PIXI.Container()
    this._container.addChild(this._backSprite)
    ScaleSprite(this._backSprite, viewWidth, viewHeight)

    return this._container
  }

  AddMarker(nameMarker, container, comp) {
    const key = 'MKR-' + nameMarker
    this.set_component(key, container, comp)
  }

  GetMarker(nameMarker) {
    const key = 'MKR-' + nameMarker
    return this.get_component(key)
  }

  set_component(key, container, comp) {
    this._components.set(key, comp)
    this._container.addChild(container)
    this.update_z_order()
  }

  get_component(key) {
    if (this._components.has(key)) {
      return this._components.get(key)
    }
    throw new Error("Component not found", key)
  }

  update_z_order(){
    let list = Array.from(this._components.values())
    this._sorted_list = list
  }

  Render(isDirty) {
    this._sorted_list.forEach(element => {
      if (element !== this._component_in_front){
        element.Render(isDirty)
      }
    });
    if (this._component_in_front){
      this._component_in_front.Render(isDirty)
    }
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


