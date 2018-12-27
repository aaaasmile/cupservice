import { CoreStateEventBase } from './core-base'
import { Player, PlayerActor } from './player'
import { TableStateCore } from './table-core'

describe('core state event base test', function () {
    it('Simple game loop', () => {
        let coreStateEvent = new CoreStateEventBase('develop');
        let tableStateCore = new TableStateCore(coreStateEvent, 2);
        let playerActorErnesto = new PlayerActor(new Player('Ernesto'), coreStateEvent);
        let playerActorLuigi = new PlayerActor(new Player('Luigi'), coreStateEvent);

        playerActorErnesto.sit_down(0);
        playerActorLuigi.sit_down(1);

        coreStateEvent.process_all();
        expect(1).toBe(1);
    });
});