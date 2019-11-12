export class StaticSceneGfx {
  constructor() {
    this.backSprite = null
    this.container = null
  }

  Build(backTexture, viewWidth, viewHeight) {
    this.backSprite = new PIXI.Sprite(backTexture)
    this.container = new PIXI.Container()
    this.container.addChild(this.backSprite)
    ScaleSprite(this.backSprite, viewWidth, viewHeight)

    return this.container
  }
}

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


