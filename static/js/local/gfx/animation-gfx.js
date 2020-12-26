export default (name, startComp, stopCom, fnTerm) => {
    let _container = new PIXI.Container()
    let _sprites = []
    let _started = false
    let _terminated = false
    let _name = name
    let _startComp = startComp
    let _stopCom = stopCom
    let _fnTerm = fnTerm
    return {
        Update(delta) {
            if (!_started) return
            //console.log('Update animation', delta)
            _sprites.forEach(s => {
                let x_on_target = false
                let y_on_target = false
                const im = s.vel_im
                const iq = s.vel_iq
               
                if (s.m_type === 'x_axis') {
                    // moving on x ...
                    //console.log('Moving on x: ', s.x, s.y)
                    s.x +=  s.vx
                    s.y = im * s.x / 1000 + iq;
                    if ((s.x > s.end_x && s.vx > 0) ||
                        (s.x < s.end_x && s.vx < 0)) {
                        x_on_target = true
                    }
                } else {
                    //moving on y ...
                    //console.log('Moving on y: ', s.x, s.y)
                    s.y +=  s.vy
                    s.x = im * s.y / 1000 + iq;
                    if ((s.y > s.end_y && s.vy > 0) ||
                        (s.y < s.end_y && s.vy < 0)) {
                        y_on_target = true
                    }
                }

                if (x_on_target || y_on_target) {
                    //console.log('Animation terminated', s)
                    _started = false
                    _terminated = true
                    s.visible = false
                }
            })
        },// end update
        CheckForStart() {
            if (_terminated) {
                return false
            }
            if (!_started) {
                _started = true
                return true
            }
            return false
        },
        get_container() { return _container },
        is_terminated() { return _terminated },
        name() { return _name },
        get_start_comp() { return _startComp },
        get_stop_comp() { return _stopCom },
        add_sprite(ss) {
            ss.ini_x = ss.x
            ss.ini_y = ss.y
            _sprites.push(ss)
            _container.addChild(ss)
        },
        complete() {
            _fnTerm(_name,_startComp, _stopCom)
        }
    }
}