import { GetCardLoaderGfx } from '../../common/gfx/card-loader_gfx.js'

export class BriscBaseGfx {
  constructor() {
    console.log('BriscBaseGfx created')
    this.opt = {
      deck_name: 'piac'
    }
  }

  renderScene(boardId) {
    console.log('BriscBaseGfx render scene', boardId)
    this.boardNode = document.getElementById(boardId)
    this.initScene()
  }

  initScene() {
    console.log('Init scene')
    
    let cardLoader = GetCardLoaderGfx()
    let cache = cardLoader.getLoaded(this.opt.deck_name)
    if (cache) {
      this.resourceLoadCompleted(cache)
    } else {
      this.loadAssets(cardLoader, this.opt.deck_name)
    }
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
          that.resourceLoadCompleted(cache)
        })
  }

  resourceLoadCompleted(cache) {
    console.log('Resource completed')
  }

}