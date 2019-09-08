import * as sc from './static-scene-gfx.js'

export class GameRenderGfx {

  constructor(match_info, gfx, optDlgGfx){
    this._math_info = match_info
    this._gfx = gfx
    this._optDlgGfx = optDlgGfx
  }

  RenderScene(boardId, cardLoader, deck_name) {
    this._boardNode = document.getElementById(boardId)
    this._cardLoader = cardLoader
    this._deck_name = deck_name
    this.buildSceneWithDeck(cardLoader, deck_name)
  }

  buildSceneWithDeck(cardLoader, deck_name) {
    let cache = cardLoader.getLoaded(deck_name)
    if (cache) {
      this.buildScene(cache)
    } else {
      if (this.deck_loading === deck_name) {
        return
      }
      this.deck_loading = deck_name
      sc.LoadAssets(cardLoader, deck_name, (cache) => {
        this.deck_loading = null
        this.buildScene(cache)
      })
    }
  }

  buildScene(cardgfxCache) {
    console.log('build scene')
    let matchInfo = this._math_info
    if (matchInfo.is_terminated()) {
      this.st_terminatedGame()
    } else if (matchInfo.is_ongoing()) {
      sc.ClearBoard(this._boardNode)
      this.st_onplayingGame(cardgfxCache)
    } else {
      this.st_beforeStartGame(cardgfxCache)
    }
  }

  st_beforeStartGame(cardgfxCache) {
    let optHtml = this._optDlgGfx.render()
    this._boardNode.insertAdjacentHTML('beforeend', `
    <div>
      <div class="ui attached message">
        <div class="ui buttons right floated content">
          <button id="startgame-btn" class="ui primary button">Inizia</button>
          <button id="optgame-btn" class="ui button">Opzioni</button>
        </div>
        <div class="header">
          Benvenuto
        </div>
        <p>Seleziona un comando per partire</p>
      </div>
      ${optHtml}
    </div>
    `)
    document.getElementById('startgame-btn')
      .addEventListener('click', (event) => {
        console.log('Start a new game')
        sc.ClearBoard(this._boardNode)
        this.st_onplayingGame(cardgfxCache)
        this._gfx.OnStartNewGame()
      });
    document.getElementById('optgame-btn')
      .addEventListener('click', () => {
        this._optDlgGfx.showModal((res) => {
          this._gfx.OnAssignOptionGfx(res)
          if (this._deck_name !== res.deck_name) {
            this._deck_name = res.deck_name
            this.buildSceneWithDeck(this._cardLoader, this._deck_name)
          }
        })
      });
  }

  st_terminatedGame() {
    console.warn('st_terminatedGame is not implemented')
    // TODO
  }

  st_onplayingGame(cardgfxCache) {
    console.log('st_onplayingGame')
    let builder = sc.CreateSceneBuilder(cardgfxCache)
    let root = this._gfx.OnCallTheBuilder(builder)
    this._boardNode.appendChild(root)
  }

}//end GameRenderGfx
