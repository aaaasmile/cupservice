describe('core state event base test', function () {
    it('Simple game loop', () => {
        let coreStateEvent = new cup.CoreStateEventBase('develop');
        let tableStateCore = new cup.TableStateCore(coreStateEvent, 2);
        let playerActorErnesto = new cup.PlayerActor(new cup.Player('Ernesto'), coreStateEvent);
        let playerActorLuigi = new cup.PlayerActor(new cup.Player('Luigi'), coreStateEvent);

        playerActorErnesto.sit_down(0);
        playerActorLuigi.sit_down(1);

        coreStateEvent.process_all();
        expect(1).toBe(1);
    });
});