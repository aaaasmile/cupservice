export class CardsPlayerGfx {
  constructor(tink) {
    this.sprites = []
    this.container = new PIXI.Container()
    this.clickHandler = new Map()
    this.numCards = 0
    this._tink = tink
  }

  Build(numCards) {
    this.numCards = numCards
    return this.container
  }

  SetCards(textures, space_x, clickable) {
    let ixTexture = 0
    let iniX = 0
    let iniY = 0
    let x = iniX
    let y = iniY

    for (let index = 0; index < this.numCards; index++) {
      const itemTexture = textures[ixTexture];
      let sprite = new PIXI.Sprite(itemTexture)
      sprite.position.set(x, y)

      if (clickable) {
        this._tink.makeInteractive(sprite)
        sprite.press = () => {
          console.log('Card is pressed')
          let keyCard = 'click-1' // TODO get the index 1 correct
          if (this.clickHandler.has(keyCard)) {
            this.clickHandler.get(keyCard)()
          }
        }
      }

      this.sprites.push(sprite)
      this.container.addChild(sprite)
      x += space_x
      if (ixTexture < textures.length) {
        ixTexture += 1
      }
    }
  }

  OnClick(event, funHandler) {
    this.clickHandler.set(event, funHandler)
  }
}