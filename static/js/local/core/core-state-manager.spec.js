describe('core state event base test', function () {
    it('table game full', () => {
        let coreStateManager = new cup.CoreStateManager('develop');
        let b2core = new cup.CoreBriscolaBase(coreStateManager, 2, 61, 3);
        let tableStateCore = new cup.TableStateCore(coreStateManager, 2);
        let playerErnesto = new cup.Player(new cup.AlgBriscBase('Ernesto', b2core._deck_info), coreStateManager, 'Ernesto');
        let playerLuigi = new cup.Player(new cup.AlgBriscBase('Luigi', b2core._deck_info), coreStateManager, 'Luigi');

        playerErnesto.sit_down(0);
        playerLuigi.sit_down(1);

        coreStateManager.process_all();
        let coreStateStore = tableStateCore._coreStateStore
        let state = coreStateStore.get_internal_state();
        expect(state).toBe('st_table_full');
    });
});


