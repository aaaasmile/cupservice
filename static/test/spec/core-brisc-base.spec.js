describe('brisc-base-core test', function () {
  it('Briscola base game loop', () => {

    let coreStateManager = new cup.CoreStateManager('develop');
    let b2core = new cup.CoreBriscolaBase(coreStateManager, 2, 61);
    let tableStateCore = new cup.TableStateCore(coreStateManager, 2);
    let subsc = tableStateCore.TableFullSub.subscribe(next => {
      subsc.unsubscribe();
      tableStateCore.dispose();
      // table is full, then start a new match
      b2core.StartNewMatch(next); // next = players  = ['Luigi', 'Ernesto']
      coreStateManager.process_all(); // play until the end
    });


    let playerActorErnesto = new cup.PlayerActor(new cup.Player('Ernesto'), coreStateManager);
    let playerActorLuigi = new cup.PlayerActor(new cup.Player('Luigi'), coreStateManager);
    new cup.AlgBriscBase(playerActorErnesto);
    new cup.AlgBriscBase(playerActorLuigi);

    playerActorErnesto.sit_down(0);
    playerActorLuigi.sit_down(1);
    
    // some garbage events
    playerActorLuigi.sit_down(1);
    playerActorLuigi.sit_down(1);
    playerActorLuigi.sit_down(1);
    coreStateManager.process_all();
    expect(1).toBe(1);
  });

  prepareGame = (rnd_mgr) => {
    console.log('Prepare game for test')
    let coreStateManager = new cup.CoreStateManager('develop');
    let b2core = new cup.CoreBriscolaBase(coreStateManager, 2, 61);
    if(rnd_mgr){
      b2core._rnd_mgr = rnd_mgr
    }
    let tableStateCore = new cup.TableStateCore(coreStateManager, 2);
    let subsc = tableStateCore.TableFullSub.subscribe(next => {
      b2core.StartNewMatch(next);
      subsc.unsubscribe();
      tableStateCore.dispose();
    });


    let playerActorErnesto = new cup.PlayerActor(new cup.Player('Ernesto'), coreStateManager);
    let playerActorLuigi = new cup.PlayerActor(new cup.Player('Luigi'), coreStateManager);
    new cup.AlgBriscBase(playerActorErnesto);
    new cup.AlgBriscBase(playerActorLuigi);

    playerActorErnesto.sit_down(0);
    playerActorLuigi.sit_down(1);
    return b2core
  }

  it('Vincitore mano', () => {
    let rnd_mgr = new cup.RndMgr();
    rnd_mgr.set_predefined_deck('_2d,_6b,_7s,_Fc,_Cd,_Rd,_Cb,_5d,_Ab,_4s,_Fb,_Cc,_7b,_As,_5s,_6d,_Fs,_Fd,_6c,_5b,_Cs,_6s,_3d,_3b,_4d,_3c,_2b,_7c,_Rs,_4c,_Rb,_2c,_4b,_2s,_Rc,_3s,_5c,_Ad,_7d,_Ac');
    rnd_mgr.set_predefined_player(0)
    let b2core = prepareGame(rnd_mgr)

    let coreStateManager = b2core._coreStateManager
    let coreStateStore = b2core._coreStateStore
    let state = coreStateStore.get_internal_state();
    let event_num = 1;
    while (state !== 'st_new_mano' && event_num > 0) {
      event_num = coreStateManager.process_next();
      state = coreStateStore.get_internal_state();
      console.log('Internal state ' + state + ' evnum ' + event_num);
    }

    let carte_giocate = [{ lbl_card: '_Fs', player: 'Ernesto' }, { lbl_card: '_Cs', player: 'Luigi' }];
    let wininfo = b2core.vincitore_mano(carte_giocate)
    //wininfo is {lbl_best: '_5c', player_best: 'Luigi'}        
    expect(wininfo.player_best).toEqual('Deg');

  })

});