import { GetCardLoaderGfx } from '../../common/gfx/card-loader_gfx.js'

export class BriscBaseGfx {
  constructor() {
    console.log('BriscBaseGfx created')
    this.opt = {
      deck_name: 'piac',
      scene_back: 'table_pattern'
    }
    this._cardLoader = GetCardLoaderGfx()
  }

  renderScene(boardId) {
    console.log('BriscBaseGfx render scene', boardId)
    this._boardNode = document.getElementById(boardId)
    this.initAndBuildScene()
  }

  initAndBuildScene() {
    console.log('Init scene')
    let cache = this._cardLoader.getLoaded(this.opt.deck_name)
    if (cache) {
      this.buildScene(cache)
    } else {
      this.loadAssets(this._cardLoader, this.opt.deck_name)
    }
  }

  buildScene(cache) {
    console.log('build scene')
    this._boardNode.appendChild(cache.cards[0]) 
  }

  loadAssets(cardLoader, deck_name) {
    console.log("Load images for ", deck_name)
    if(!deck_name){
      throw new Error('deck name not set')
    }
    let totItems = -1
    let that = this
    cardLoader.loadResources(deck_name)
      .subscribe(x => {
        if (totItems === -1) {
          totItems = x
          console.log("Expect total items to load: ", x)
          return
        }
      },
        (err) => {
          console.error("Load error", err)
        }, () => {
          console.log("Load Completed")
          let cache = cardLoader.getLoaded(deck_name)
          that.buildScene(cache)
        })
  }

  

}