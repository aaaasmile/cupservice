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
});