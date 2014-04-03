function State() {
    var f = function(d) {};

    this.begin = f;
    this.end = f;
    this.process = f;
    this.render = f;
    this.pause = f;
    this.resume = f;
    this.events = {};
}

function Engine() {
    var f = function(d) {},
        h = null,
        rate = 1000 / fps,
        names = {},
        active = null,
        activeP = f,
        activeR = f,
        states = [],
        running = true,
        cvs = null,
        cxt = null,
        d = {};

    function setState(i) {
        var s = states[i];
        if (active) {
            active.end.call(cvs, d);
        }
        s.begin.call(cvs, d);
        active = s;
        activeP = s.process;
        activeR = s.render;
    }

    function cycle() {
        if (running) activeP.call(cvs, d, cxt);
        cxt.fillStyle = '#000';
        cxt.fillRect(0, 0, cvs.w, cvs.h);
        activeR.call(cvs, d, cxt);
    }
    
    this.init = function(canvas) {
        this.stop();
        active = null;
        activeP = f;
        activeR = f;
        running = true;
        cvs = canvas;
        cxt = cvs.c;
        d = {};
    };
    this.start = function() {
        if (h) return;
        if (!states.length) return;
        if (!active) setState(0);
        h = setInterval(cycle, rate);
    };
    this.stop = function() {
        clearInterval(h);
        h = null;
        if (!active) return;
        d = active.end.call(cvs, d);
        active = null;
        activeP = f;
        activeR = f;
    };
    this.pause = function() {
        running = false;
        active.pause.call(cvs, d);
    };
    this.resume = function() {
        running = true;
        active.resume.call(cvs, d);
    };
    this.addState = function(name, state) {
        states.push(state);
        names[name] = states.length - 1;
    };
    this.addStates = function(obj) {
        for (var k in obj) {
            this.addState(k, obj[k]);
        }
    };
    this.to = function(name) {
        if (!names[name]) return;
        setState(names[name]);
    };
    this.trigger = function(name, params) {
        if (!active) return;
        var evts = active.events;
        if (!evts[name]) return;
        evts[name].call(cvs, d, params);
    };
}

function Game() {
    this.ns = '.game' + Game.count++;
    this.canvas = null;
    this.engine = new Engine();
    this.running = false;
    this.states = {};
    this.init = null;
}
Game.count = 0;
Game.prototype.setCvs = function(cvs) {
    var c = this.canvas = {},
        e = cvs.get(0);
    c.e = cvs;
    c.w = e.width;
    c.h = e.height;
    c.c = e.getContext('2d');
    c.x = 0;
    c.y = 0;
    c.mX = 0;
    c.mY = 0;
    this.getCvsPos(c);
};
Game.prototype.start = function(cvs) {
    if (!this.init) return;
    if (!(this.canvas || cvs)) return;
    if (cvs) {
        this.setCvs(cvs);
        this.setEvents(cvs);
    }
    var n = this.ns,
        c = this.canvas,
        e = this.engine,
        s = this.states;
    e.init(c);
    this.init(s);
    e.addStates(s);
    e.start();
    this.running = true;
};
Game.prototype.stop = function() {
    this.engine.stop();
    this.running = false;
};
Game.prototype.getCvsPos = function() {
    var c = this.canvas, o = c.e.offset();
    c.x = o.left;
    c.y = o.top;
};
Game.prototype.getMsPos = function(mX, mY) {
    var c = this.canvas;
    c.mX = mX - c.x;
    c.mY = mY - c.y;
};
Game.prototype.setEvents = function(cvs) {
    var g = this, n = this.ns;
    function reposition(e) {
        g.getCvsPos();
    }
    function clicked(e) {
        g.trigger('clicked');
    }
    function mmoved(e) {
        g.getMsPos(e.pageX, e.pageY);
    }
    wnd.off(n).on(['resize'+n, 'scroll'+n].join(' '), reposition);
    cvs.off(n).on('click'+n, clicked).on('mousemove'+n, mmoved);
};
Game.prototype.initState = function(name, f) {
    this.states[name] = new State();
    f(this.states[name]);
};
Game.prototype.pause = function() {
    this.engine.pause();
    this.running = false;
};
Game.prototype.resume = function() {
    this.engine.resume();
    this.running = true;
};
Game.prototype.to = function(name) {
    this.engine.to(name);
};
Game.prototype.trigger = function(name, params) {
    this.engine.trigger(name, params);
};
