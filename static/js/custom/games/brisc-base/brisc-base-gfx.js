import { GetCardLoaderGfx } from '../../common/gfx/card-loader_gfx.js'
import { CoreStateManager } from '../../common/core/core-state-manager.js'
import { TableStateCore } from '../../common/class/table-state-core.js'
import { Player } from '../../common/class/player.js'
import { CoreBriscolaBase } from './core-brisc-base.js'
import { AlgBriscBase } from './alg-brisc-base.js'


export class BriscBaseGfx {
  constructor() {
    console.log('BriscBaseGfx created')
    this.opt = {
      deck_name: 'piac',
      scene_back: 'table_pattern'
    }
    this._cardLoader = GetCardLoaderGfx()
  }

  prepareGame(rnd_mgr) {
    console.log('Prepare game')
    let coreStateManager = new CoreStateManager('develop');
    let b2core = new CoreBriscolaBase(coreStateManager, 2, 61);
    if (rnd_mgr) {
      b2core._rnd_mgr = rnd_mgr
    }
    let tableStateCore = new TableStateCore(coreStateManager, 2);
    let subsc = tableStateCore.TableFullSub.subscribe(next => {
      subsc.unsubscribe();
      tableStateCore.dispose();
      b2core.StartNewMatch(next);
    });

    if (this.playerCpu) {
      this.playerCpu.dispose()
    }
    if (this.playerMe) {
      this.playerMe.dispose()
    }

    this.playerCpu = new Player(new AlgBriscBase('Ernesto'), coreStateManager);
    this.playerMe = new Player(new AlgBriscBase('Luigi'), coreStateManager); // TODO manca l'handling delle notifiche in questo gfx

    this.playerCpu.sit_down(0);
    this.playerMe.sit_down(1);
    return b2core
  }

  renderScene(boardId) {
    console.log('BriscBaseGfx render scene', boardId)
    this._boardNode = document.getElementById(boardId)
    this.initAndBuildScene()
  }

  initAndBuildScene() {
    console.log('Init scene')
    if (!this._b2core) {
      this._b2core = this.prepareGame(null)
    }
    let cache = this._cardLoader.getLoaded(this.opt.deck_name)
    if (cache) {
      this.buildScene(cache)
    } else {
      this.loadAssets(this._cardLoader, this.opt.deck_name)
    }
  }

  buildScene(cache) {
    console.log('build scene')
    this.st_beforeStartGame() // TODO lo stato dipende dal this._b2core
    //this._boardNode.appendChild(cache.cards[0]) // TODO set card from a class
  }

  st_beforeStartGame() {
    this._boardNode.insertAdjacentHTML('beforeend', `
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
    `)
    document.getElementById('startgame-btn')
      .addEventListener('click', (event) => {
        console.log('Start a new game')// TODO
      });
    document.getElementById('optgame-btn')
      .addEventListener('click', (event) => {
        console.log('Game options')// TODO
      });
  }

  loadAssets(cardLoader, deck_name) {
    console.log("Load images for ", deck_name)
    if (!deck_name) {
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