describe('brisc-base-core test', function () {
  it('Briscola base game loop', () => {

    let coreStateEvent = new cup.CoreStateEventBase('develop');
    let b2core = new cup.CoreBriscolaBase(coreStateEvent, 2, 61);
    let tableStateCore = new cup.TableStateCore(coreStateEvent, 2);
    let subsc = tableStateCore.TableFullSub.subscribe(next => {
      b2core.StartNewMatch(next);
      subsc.unsubscribe();
      tableStateCore.dispose();
    });


    let playerActorErnesto = new cup.PlayerActor(new cup.Player('Ernesto'), coreStateEvent);
    let playerActorLuigi = new cup.PlayerActor(new cup.Player('Luigi'), coreStateEvent);
    new cup.AlgBriscBase(playerActorErnesto);
    new cup.AlgBriscBase(playerActorLuigi);

    playerActorErnesto.sit_down(0);
    playerActorLuigi.sit_down(1);

    coreStateEvent.process_all();
    // some garbage events
    playerActorLuigi.sit_down(1);
    playerActorLuigi.sit_down(1);
    playerActorLuigi.sit_down(1);
    coreStateEvent.process_all();
    expect(1).toBe(1);
  });

  prepareGame = (rnd_mgr) => {
    console.log('Prepare game for test')
    let coreStateEvent = new cup.CoreStateEventBase('develop');
    let b2core = new cup.CoreBriscolaBase(coreStateEvent, 2, 61);
    if(rnd_mgr){
      b2core._rnd_mgr = rnd_mgr
    }
    let tableStateCore = new cup.TableStateCore(coreStateEvent, 2);
    let subsc = tableStateCore.TableFullSub.subscribe(next => {
      b2core.StartNewMatch(next);
      subsc.unsubscribe();
      tableStateCore.dispose();
    });


    let playerActorErnesto = new cup.PlayerActor(new cup.Player('Ernesto'), coreStateEvent);
    let playerActorLuigi = new cup.PlayerActor(new cup.Player('Luigi'), coreStateEvent);
    new cup.AlgBriscBase(playerActorErnesto);
    new cup.AlgBriscBase(playerActorLuigi);

    playerActorErnesto.sit_down(0);
    playerActorLuigi.sit_down(1);
    return b2core
  }

  it('Vincitore mano', () => {
    let rnd_mgr = new cup.RndMgr();
    rnd_mgr.set_predefined_deck('_2d,_6b,_7s,_Fc,_Cd,_Rd,_Cb,_5d,_Ab,_4s,_Fb,_Cc,_7b,_As,_5s,_6d,_Fs,_Fd,_6c,_5b,_Cs,_6s,_3d,_3b,_4d,_3c,_2b,_7c,_Rs,_4c,_Rb,_2c,_4b,_2s,_Rc,_3s,_5c,_Ad,_7d,_Ac', 0);

    let b2core = prepareGame(rnd_mgr)

    let coreStateEvent = b2core.
    let state = b2core.get_internal_state();
    let event_num = 1;
    while (state !== 'st_new_mano' && event_num > 0) {
      event_num = b2core.process_next();
      state = b2core.get_internal_state();
      console.log('Internal state ' + state + ' evnum ' + event_num);
    }

    let carte_giocate = [{ lbl_card: '_Fs', player: 'Ernesto' }, { lbl_card: '_Cs', player: 'Luigi' }];
    let wininfo = b2core.vincitore_mano(carte_giocate)
    //wininfo is {lbl_best: '_5c', player_best: 'Luigi'}        
    expect(wininfo.player_best).toEqual('Deg');

  })

});