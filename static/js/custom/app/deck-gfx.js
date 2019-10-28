export class DeckGfx {
  constructor() {
    this.deckSprite = []
    this.briscola = null
    this.container = new PIXI.Container()
  }

  Build(numCardsOnDeck, deckItemTexture, briscolaTexture) {
    let iniX = 10
    let intY = 0
    let x = iniX
    let y = intY
    for (let index = 0; index < numCardsOnDeck; index++) {
      let sprite = new PIXI.Sprite(deckItemTexture)
      sprite.position.set(x, y)
      this.container.addChild(sprite)
      x += 1
      y += 1
    }
    return this.container
  }

  PopCard(num) {

  }
}