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
      this.deckSprite.push(sprite)
      this.container.addChild(sprite)
      x += 1
      y += 1
    }
    return this.container
  }

  PopCard(num) {
    for (let index = 0; index < num; index++) {
      let item = this.deckSprite.pop()
      if (item) {
        this.container.removeChild(item)
      }else if(this.briscola){
        this.container.removeChild(this.briscola)
        this.briscola = null
      }
    }
  }
}