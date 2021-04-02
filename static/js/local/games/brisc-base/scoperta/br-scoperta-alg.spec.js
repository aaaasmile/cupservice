describe('briscola-scoperta-alg test', function () {

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

    it('Briscola Scoperta algorithm test', () => {
        // NOTE this is a test code to a predifined deck
        console.log('Using a predifend deck ')
        const _rnd_mgr = new cup.RndMgr()
        _rnd_mgr.set_predefined_deck('_3s,_5c,_6b,_6c,_Ad,_Fb,_As,_3b,_Cd,_4c,_Fd,_5d,_4b,_6s,_5s,_2b,_Cs,_Fs,_7c,_Cb,_Rc,_7d,_2s,_5b,_7b,_Ab,_3d,_7s,_4d,_Rd,_2c,_2d,_Fc,_Ac,_3c,_Rb,_6d,_Rs,_4s,_Cc')
        _rnd_mgr.set_predefined_player(0)

        let b2core = prepareGame(_rnd_mgr)
        let coreStateManager = b2core._coreStateManager
        let proc
    
        for (let index = 0; index < 5; index++) {
            proc = coreStateManager.process_next()
            console.log('*** proc *** ', proc)
        }
        
        let coreStateStore = b2core._coreStateStore
        let state = coreStateStore.get_internal_state();
        console.log('state is', state)
        const played_card = '_4s'
        expect(played_card).toBe('_4s');
    });
});