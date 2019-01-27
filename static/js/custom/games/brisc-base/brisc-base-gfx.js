import { GetCardLoaderGfx } from '../../common/gfx/card-loader_gfx.js'
import { CoreStateManager } from '../../common/core/core-state-manager.js'
import { TableStateCore } from '../../common/class/table-state-core.js'
import { Player } from '../../common/class/player.js'
import { CoreBriscolaBase } from './core-brisc-base.js'
import { AlgBriscBase } from './alg-brisc-base.js'
import { BriscBaseOptGfx } from './brisc-base-opt-gfx.js'
import { CreateDiv, BuildStaticSceneHtml } from './static-scene-gfx.js'


export class BriscBaseGfx {
  constructor() {
    console.log('BriscBaseGfx created')
    this._opt = {
      deck_name: 'piac',
      scene_back: 'table_pattern'
    }
    this._cardLoader = GetCardLoaderGfx()
    this._that = this
  }

  prepareGame(rnd_mgr, gfx) {
    console.log('Prepare game')
    let coreStateManager = new CoreStateManager('develop');
    let b2core = new CoreBriscolaBase(coreStateManager, 2, 61);
    if (rnd_mgr) {
      b2core._rnd_mgr = rnd_mgr
    }

    if (this.playerCpu) {
      this.playerCpu.dispose()
    }
    if (this.playerMe) {
      this.playerMe.dispose()
    }

    this.playerCpu = new Player(new AlgBriscBase('Ernesto'), coreStateManager);
    this.playerMe = new Player(new AlgBriscBase('Luigi'), coreStateManager);
    this._core_caller = this.playerMe.set_gfx_on_alg(gfx)
    this.playerMe._alg.set_to_master_level()
    this.playerCpu._alg.set_to_master_level()
    //this.playerMe._alg.set_automatic_playing(true) // Want to have an automatic gui player

    coreStateManager.process_next()
    return b2core
  }

  renderScene(boardId) {
    console.log('BriscBaseGfx render scene', boardId)
    this._boardNode = document.getElementById(boardId)
    if (!this._b2core) {
      this._b2core = this.prepareGame(null, this._that)
      this._optDlgGfx = new BriscBaseOptGfx(this._b2core._myOpt.num_segni_match, this._opt.deck_name)
    }
    this.buildSceneWithDeck(this._cardLoader, this._opt.deck_name)
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
      this.loadAssets(cardLoader, deck_name, (cache) => {
        this.deck_loading = null
        this.buildScene(cache)
      })
    }
  }

  buildScene(cardgfxCache) {
    console.log('build scene')
    let matchInfo = this._b2core._core_data.match_info
    if (matchInfo.is_terminated()) {
      this.st_terminatedGame()
    } else if (matchInfo.is_ongoing()) {
      this.st_onplayingGame(cardgfxCache)
    } else {
      this.st_beforeStartGame(cardgfxCache)
    }
  }

  startNewGame(cardgfxCache) {
    console.log('Start a new Game')
    let tableStateCore = new TableStateCore(this._b2core._coreStateManager, this._b2core._myOpt.tot_num_players);
    let b2core = this._b2core
    let subsc = tableStateCore.TableFullSub.subscribe(next => {
      subsc.unsubscribe();
      tableStateCore.dispose();
      b2core.StartNewMatch(next);
    });

    this.clearBoard()
    this.st_onplayingGame(cardgfxCache)

    this.playerCpu.sit_down(0);
    this.playerMe.sit_down(1);
    this._b2core._coreStateManager.process_all()
  }

  // getOptionsForNewGame() { ????????
  //   return {
  //     players: [this.playerCpu._name, this.playerMe._name] //TOD set all other options from dialogbox
  //   }
  // }

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
        this.startNewGame(cardgfxCache)
      });
    document.getElementById('optgame-btn')
      .addEventListener('click', () => {
        this._optDlgGfx.showModal((res) => {
          this._b2core.num_segni_match = res.num_segni_match
          if (this._opt.deck_name !== res.deck_name) {
            this._opt.deck_name = res.deck_name
            this.buildSceneWithDeck(this._cardLoader, this._opt.deck_name)
          }
        })
      });
  }

  st_onplayingGame(cardgfxCache) {
    console.log('st_onplayingGame')
    let builder = BuildStaticSceneHtml(cardgfxCache)
    let root = builder(this.handCpuGxc, this.handMeGxc)
    this._boardNode.appendChild(root)
  }

  st_terminatedGame() {
    console.warn('st_terminatedGame is not im plemented')
    // TODO
  }

  handMeGxc(cardgfxCache) {
    let handMeDiv = CreateDiv("handMe")
    for (let i = 0; i < 3; i++) {
      let cardInHand = CreateDiv("cardHand")
      cardInHand.setAttribute("data-card", `_As`) // TOD set from core
      let img = cardgfxCache.get_cardimage(10)
      cardInHand.appendChild(img)
      handMeDiv.appendChild(cardInHand)
    }
    return handMeDiv
  }

  handCpuGxc(cardgfxCache) {
    let handCpu = CreateDiv("handCpu")
    for (let i = 0; i < 3; i++) { // TODO set from core
      let cardInHand = CreateDiv("cardDecked")
      let img = cardgfxCache.get_symbol_img('cope')
      cardInHand.appendChild(img)
      handCpu.appendChild(cardInHand)
    }
    return handCpu
  }

  clearBoard() {
    while (this._boardNode.firstChild) {
      this._boardNode.removeChild(this._boardNode.firstChild);
    }
  }

  on_all_ev_new_match(args) {
    console.log('New match')
  }

  loadAssets(cardLoader, deck_name, cbLoaded) {
    console.log("Load images for ", deck_name)
    if (!deck_name) {
      throw new Error('deck name not set')
    }
    let totItems = -1
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
          cbLoaded(cache)
        })
  }



}