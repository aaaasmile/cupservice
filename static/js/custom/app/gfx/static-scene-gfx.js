export class StaticSceneGfx {
  constructor() {
    this.backSprite = null
    this.container = new PIXI.Container()
  }

  Build(backTexture, viewWidth, viewHeight) {
    this.backSprite = new PIXI.Sprite(backTexture)
    this.container.addChild(this.backSprite)
    this.scaleContainer(viewWidth, viewHeight)
    return this.container
  }

  scaleContainer(viewHeight, viewWidth) {
    //this.backSprite.anchor.set(0.5, 0.5)
    //this.backSprite.scale.y = viewHeight / this.backSprite.height;
    //this.backSprite.scale.x = viewWidth / this.backSprite.width;
    // TODO: correggi lo scale che non va a modo
    this.container.scale.set(0.5, 0.5)
    console.log('Scale back is ', this.container.scale.y, viewHeight, this.backSprite.height, viewWidth, this.backSprite.width)
  }
}