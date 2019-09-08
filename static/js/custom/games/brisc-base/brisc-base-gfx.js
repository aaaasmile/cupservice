import { GetCardLoaderGfx } from '../../common/gfx/card-loader_gfx.js'
import { CoreStateManager } from '../../common/core/core-state-manager.js'
import { TableStateCore } from '../../common/class/table-state-core.js'
import { Player } from '../../common/class/player.js'
import { CoreBriscolaBase } from './core-brisc-base.js'
import { AlgBriscBase } from './alg-brisc-base.js'
import { BriscBaseOptGfx } from './brisc-base-opt-gfx.js'
import { GameRenderGfx } from '../../common/gfx/game-render-gfx.js'
import * as sc from '../../common/gfx/static-scene-gfx.js'


export class BriscBaseGfx {
  constructor() {
    console.log('BriscBaseGfx created')
    this._opt = {
      deck_name: 'piac',
      scene_back: 'table_pattern'
    }
    this._cardLoader = GetCardLoaderGfx()

  }

  initGame(rnd_mgr, gfx) {
    console.log('initGame')
    let coreStateManager = new CoreStateManager('develop');
    let b2core = new CoreBriscolaBase(coreStateManager, 2, 61);
    if (rnd_mgr) {
      b2core._rnd_mgr = rnd_mgr
    }
    this._b2core = b2core
    this._optDlgGfx = new BriscBaseOptGfx(b2core._myOpt.num_segni_match, this._opt.deck_name)

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
    this.playerMe.set_avatar('christian', 'Me')
    this.playerCpu._alg.set_to_master_level()
    this.playerCpu.set_avatar('', 'CPU')
    //this.playerMe._alg.set_automatic_playing(true) // Want to have an automatic gui player

    let that = this
    this._gameRender = new GameRenderGfx(b2core._core_data.match_info, that, this._optDlgGfx)

    coreStateManager.process_next()
  }

  RenderScene(boardId) {
    // called from app.jsx
    console.log('BriscBaseGfx render scene', boardId)
    this._boardNode = document.getElementById(boardId)
    if (!this._b2core) {
      this.initGame(null, this)
    }
    this._gameRender.RenderScene(boardId, this._cardLoader, this._opt.deck_name)
  }

  // Callbaccks of GameRenderGfx - start

  OnStartNewGame() {
    console.log('Start a new Game')
    let tableStateCore = new TableStateCore(this._b2core._coreStateManager, this._b2core._myOpt.tot_num_players);
    let b2core = this._b2core
    let subsc = tableStateCore.TableFullSub.subscribe(next => {
      subsc.unsubscribe();
      tableStateCore.dispose();
      b2core.StartNewMatch(next);
    });

    this.playerCpu.sit_down(0);
    this.playerMe.sit_down(1);
    this._b2core._coreStateManager.process_all()
  }

  OnCallTheBuilder(builder) {
    let root = builder(
      sc.HandCpuGxc, [this.playerCpu, this._b2core._core_data],
      sc.CpuPlayerGxc, [this.playerCpu],
      sc.HandMeGxc, [this.playerMe, this._b2core._deck_info, this.handleClickCard, this._b2core._core_data],
      sc.MePlayerGxc, [this.playerMe]
    )
    return root
  }

  OnAssignOptionGfx(res) {
    this._b2core.num_segni_match = res.num_segni_match
  }

  // Callbaccks of GameRenderGfx - end

  handleClickCard(card) {
    console.log('Card clicked...', card)
  }

  on_all_ev_new_match(args) {
    console.log('New match', args)
  }

  on_pl_ev_brisc_new_giocata(args) {
    this._b2core._coreStateManager.suspend_proc_gevents('Start animation new giocata') // stop core processing until animation end

    console.log('New giocata', args)

    let cardgfxCache = this._cardLoader.getCurrentCache()

    let obsAnimator = rxjs.Observable.create((obs) => {
      sc.AnimateHandMe(this._boardNode, args.carte, cardgfxCache, obs, this._b2core._deck_info, this.handleClickCard)
      sc.AnimateHandCpu(this._boardNode, cardgfxCache, obs, this._b2core._core_data.num_of_cards_onhandplayer)
    })
    let aniCount = 0
    obsAnimator.subscribe(x => {
      console.log('Animation observed', x)
      aniCount++;
      if (aniCount >= this._b2core._core_data.num_of_cards_onhandplayer * 2) {
        console.log('All animatios are completed')
        this._b2core._coreStateManager.continue_process_events('Animation end')
      }
    })
  }// end on_pl_ev_brisc_new_giocata



}//end BriscBaseGfx