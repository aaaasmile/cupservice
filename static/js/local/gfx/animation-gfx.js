export default (state, startComp, stopCom, fnTerm) => {
    let _container = state.container
    let _sprites = state.sprites
    let _started = state.started
    let _terminated = state.terminated
    let _name = state.name
    let _startComp = startComp
    let _stopCom = stopCom
    let _fnTerm = fnTerm
    return {
        Update(delta) {
            if (_started) {
                //console.log('Update animation')
                _sprites.forEach(s => {
                    s.x += s.vx
                    s.y += s.vy
                    if (s.x > s.end_x && s.y > s.end_y ){
                        console.log('Animation terminated', s)
                        _fnTerm(_name)
                        _started = false
                    }
                });
            }
        },
        CheckForStart() { 
            if (!_started){
                _started = true
                _sprites = []
                _container = new PIXI.Container()
                return true
            }
            return false 
        },
        get_container() { return _container },
        is_terminated() { return _terminated },
        name() { return _name },
        get_start_comp() {return _startComp},
        get_stop_comp() {return _stopCom},
        add_sprite(ss){
            _sprites.push(ss)
            _container.addChild(ss)
        }
    }
}