export class StaticSceneGfx {
  constructor() {
    this._backSprite = null
    this._container = null
    this._components = new Map()
  }

  Build(backTexture, viewWidth, viewHeight) {
    this._backSprite = new PIXI.Sprite(backTexture)
    this._container = new PIXI.Container()
    this._container.addChild(this._backSprite)
    ScaleSprite(this._backSprite, viewWidth, viewHeight)

    return this._container
  }

  AddMarker(nameMarker, container) {
    this._components.set('MKR-' + nameMarker, container)
    this._container.addChild(container)
  }

  GetMarker(nameMarker) {
    const key = 'MKR-' + nameMarker
    return this.get_component(key)
  }

  get_component(key) {
    if (this._components.has(key)) {
      return this._components.get(key)
    }
    throw new Error("Component not found", key)
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


