import { CoreStateEventBase } from '../../common/core/core-base'
import { Player, PlayerActor } from '../../common/core/player'
import { TableStateCore } from '../../common/core/table-core'
import { CoreBriscolaBase } from './core-brisc-base'
import { AlgBriscBase } from './alg-brisc-base'

describe('brisc-base-core test', function () {
  it('Simple game loop', () => {

    let coreStateEvent = new CoreStateEventBase('develop');
    let b2core = new CoreBriscolaBase(coreStateEvent, 2, 61);
    let tableStateCore = new TableStateCore(coreStateEvent, 2);
    let subsc = tableStateCore.TableFullSub.subscribe(next => {
      b2core.StartNewMatch(next);
      subsc.unsubscribe();
      tableStateCore.dispose();
    });
    

    let playerActorErnesto = new PlayerActor(new Player('Ernesto'), coreStateEvent);
    let playerActorLuigi = new PlayerActor(new Player('Luigi'), coreStateEvent);
    new AlgBriscBase(playerActorErnesto);
    new AlgBriscBase(playerActorLuigi);

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