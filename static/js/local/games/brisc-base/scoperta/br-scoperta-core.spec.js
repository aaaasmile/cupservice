describe('briscola-scoperta-core test', function () {

    prepareGame = (rnd_mgr) => {
        console.log('Prepare game for test')
        let coreStateManager = new cup.CoreStateManager('develop');
        let b2core = new cup.CoreBriscolaScoperta(coreStateManager, 2, 61, 3, 120);
        if (rnd_mgr) {
            b2core._rnd_mgr = rnd_mgr
        }
        let tableStateCore = new cup.TableStateCore(coreStateManager, 2);
        let subsc = tableStateCore.TableFullSub.addNextEventListener(next => {
            tableStateCore.TableFullSub.removeNextEventListener(subsc)
            tableStateCore.dispose();
            b2core.StartNewMatch(next);
        });


        let playerErnesto = new cup.Player(new cup.AlgBriscScoperta('Ernesto', b2core._deck_info, 'master'), coreStateManager);
        let playerLuigi = new cup.Player(new cup.AlgBriscScoperta('Luigi', b2core._deck_info), coreStateManager);

        playerErnesto.sit_down(0);
        playerLuigi.sit_down(1);
        return b2core
    }

    it('Briscola Scoperta base game loop', () => {

        let b2core = prepareGame(null)
        let coreStateManager = b2core._coreStateManager
        coreStateManager.process_all()
        let coreStateStore = b2core._coreStateStore
        let state = coreStateStore.get_internal_state();
        expect(state).toBe('st_match_end');
    });
});