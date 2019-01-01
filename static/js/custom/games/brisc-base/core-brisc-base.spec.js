describe('brisc-base-core test', function () {

  prepareGame = (rnd_mgr) => {
    console.log('Prepare game for test')
    let coreStateManager = new cup.CoreStateManager('develop');
    let b2core = new cup.CoreBriscolaBase(coreStateManager, 2, 61);
    if (rnd_mgr) {
      b2core._rnd_mgr = rnd_mgr
    }
    let tableStateCore = new cup.TableStateCore(coreStateManager, 2);
    let subsc = tableStateCore.TableFullSub.subscribe(next => {
      subsc.unsubscribe();
      tableStateCore.dispose();
      b2core.StartNewMatch(next);
    });


    let playerActorErnesto = new cup.PlayerActor(new cup.Player('Ernesto'), coreStateManager);
    let playerActorLuigi = new cup.PlayerActor(new cup.Player('Luigi'), coreStateManager);
    new cup.AlgBriscBase(playerActorErnesto);
    new cup.AlgBriscBase(playerActorLuigi);

    playerActorErnesto.sit_down(0);
    playerActorLuigi.sit_down(1);
    return b2core
  }

  it('Briscola base game loop', () => {

    let b2core = prepareGame(null)
    let coreStateManager = b2core._coreStateManager
    coreStateManager.process_all()
    let coreStateStore = b2core._coreStateStore
    let state = coreStateStore.get_internal_state();
    expect(state).toBe('st_game_end');
  });

  it('Punteggio giocata end', () => {
    let rnd_mgr = new cup.RndMgr();
    rnd_mgr.set_predefined_deck( '_3s,_5c,_6b,_6c,_Ad,_Fb,_As,_3b,_Cd,_4c,_Fd,_5d,_4b,_6s,_5s,_2b,_Cs,_Fs,_7c,_Cb,_Rc,_7d,_2s,_5b,_7b,_Ab,_3d,_7s,_4d,_Rd,_2c,_2d,_Fc,_Ac,_3c,_Rb,_6d,_Rs,_4s,_Cc')
    rnd_mgr.set_predefined_player(1)
    let b2core = prepareGame(rnd_mgr)
    let coreStateManager = b2core._coreStateManager
    let coreStateStore = b2core._coreStateStore
    let resProc = coreStateManager.process_next();
    let state = coreStateStore.get_internal_state();
    while (state !== 'st_giocata_end' && resProc.value > 0) {
      resProc = coreStateManager.process_next(); // use generators {done: false, value: 2}
      state = coreStateStore.get_internal_state();
      console.log('Internal state ' + state + ' resProc ', resProc);
    }
    let bestpoints_info = b2core._core_data.giocata_info.bestpoints_info // {best: Array(2), is_match_end: false}
    //console.log(bestpoints_info)
    let arr = bestpoints_info.best // arr = ["Ernesto", 85], ["Luigi", 35]
    expect(arr[0][1] >= arr[1][1]).toBe(true)
  })

  it('Vincitore mano', () => {
    let rnd_mgr = new cup.RndMgr();
    rnd_mgr.set_predefined_deck('_2d,_6b,_7s,_Fc,_Cd,_Rd,_Cb,_5d,_Ab,_4s,_Fb,_Cc,_7b,_As,_5s,_6d,_Fs,_Fd,_6c,_5b,_Cs,_6s,_3d,_3b,_4d,_3c,_2b,_7c,_Rs,_4c,_Rb,_2c,_4b,_2s,_Rc,_3s,_5c,_Ad,_7d,_Ac');
    rnd_mgr.set_predefined_player(0)
    let b2core = prepareGame(rnd_mgr)

    let coreStateManager = b2core._coreStateManager
    let coreStateStore = b2core._coreStateStore
    let resProc = coreStateManager.process_next();
    let state = coreStateStore.get_internal_state();
    while (state !== 'st_new_mano' && resProc.value > 0) {
      resProc = coreStateManager.process_next(); // use generators {done: false, value: 2}
      state = coreStateStore.get_internal_state();
      console.log('Internal state ' + state + ' resProc ', resProc);
    }

    let carte_giocate = [{ lbl_card: '_Fs', player: 'Ernesto' }, { lbl_card: '_Cs', player: 'Luigi' }];
    let wininfo = b2core.vincitore_mano(carte_giocate)
    //wininfo is for example {lbl_best: '_5c', player_best: 'Luigi'}        
    expect(wininfo.player_best).toEqual('Luigi');

  })

  it('Calcola punteggio', () => {
    let b2core = new cup.CoreBriscolaBase(new cup.CoreStateManager('develop'), 2, 61);
    let points = b2core.calc_punteggio(['_As', '_7c'])
    expect(points).toEqual(11)
    points = b2core.calc_punteggio(['_3s', '_Fc'])
    expect(points).toEqual(12)
  })

});