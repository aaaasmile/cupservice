describe('core state event base test', function () {
    it('table game full', () => {
        let coreStateManager = new cup.CoreStateManager('develop');
        let tableStateCore = new cup.TableStateCore(coreStateManager, 2);
        let playerActorErnesto = new cup.PlayerActor(new cup.Player('Ernesto'), coreStateManager);
        let playerActorLuigi = new cup.PlayerActor(new cup.Player('Luigi'), coreStateManager);

        playerActorErnesto.sit_down(0);
        playerActorLuigi.sit_down(1);

        coreStateManager.process_all();
        let coreStateStore = tableStateCore._coreStateStore
        let state = coreStateStore.get_internal_state();
        expect(state).toBe('st_table_full');
    });
});


