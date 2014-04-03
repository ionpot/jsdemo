function Navi(items) {
    this.cntr = null;
    this.svg = null;
    this.defs = null;
    this.list = null;
    this.items = {};
    this.panels = {};
    this.text = {};
    this.itemsT = items;
    this.hovered = false;
    this.chosen = {};
    this.handlers = {};
    this.y = 20;
    this.w = 0;
    this.h = 0;
    this.iC = this.itemsT.length;
    this.iW = 0;
    this.iH = 50;
    this.sW = 4;
    this.pD = {};
    this.pT = this.y + this.sW/2;
    this.pL = -this.sW/2;
    this.pFill = 'url(#pGrd)';
    this.tFill = '#DDD';
    this.tM = 10;
    this.tT = this.y + this.iH/2;
    this.tL = 0;
    this.a = null;
}
Navi.prototype.createIn = function(cntr, css) {
    this.cntr = cntr;
    this.w = cntr.width();
    this.h = cntr.height();
    this.iW = (this.w - this.pL*this.iC) / this.iC + this.sW;
    this.tL = this.iW / 2;
    var s = this.svg = new SVG.Element(this.w, this.h);
    this.setupDefs(s);
    this.setupPaths();
    cntr.append(this.svg.root);
    this.place(css);
};
Navi.prototype.setupDefs = function(s) {
    var d = s.addNode('defs');
    this.defs = d;
    this.maskDef(s, d);
};
Navi.prototype.setupPaths = function() {
    var pD = this.pD,
        d = null,
        iW = this.iW,
        iH = this.iH;
    d = pD['first'] = new SVG.PathData();
    d.setY(0, this.pT);
    d.setX(1, iW);
    d.setX(2, -iW/4);
    d.setY(2, iH);
    d.setX(3, iW/4 - iW);
    d = pD['middle'] = new SVG.PathData();
    d.setY(0, this.pT);
    d.setX(1, iW);
    d.setX(2, -iW/4);
    d.setY(2, iH);
    d.setX(3, -iW);
    d = pD['last'] = new SVG.PathData();
    d.setY(0, this.pT);
    d.setX(1, iW);
    d.setY(2, iH);
    d.setX(3, -iW-iW/4);
};
Navi.prototype.maskDef = function(s, d) {
    var msk = s.addNode(d, 'mask', {"id" : "msk"}),
        grd = s.addNode(d, 'linearGradient', {"id" : "grd"}),
        sA = {
            "offset" : "0",
            "stop-color" : "white",
            "stop-opacity" : "0"
        },
        aA = {
            "attributeName" : "stop-opacity",
            "attributeType" : "XML",
            "fill" : "freeze",
            "begin" : "0s",
            "dur" : "1s",
            "from" : "0",
            "to" : "1"
        },
        sN = s.addNode(grd, 'stop', sA);
    s.addNode(sN, 'animate', aA);
    
    sA.offset = '1';
    sN = s.addNode(grd, 'stop', sA);

    aA.begin = '0.5s';
    s.addNode(sN, 'animate', aA);

    s.addNode(msk, 'rect', {
        "x" : 0,
        "y" : 0,
        "width" : this.w,
        "height" : this.h,
        "fill" : "url(#grd)"
    });
};
Navi.prototype.place = function(css) {
    var s = this.svg,
        g = this.list = s.addNode('g', {
            "id" : "navi-items",
            "font-family" : "Tahoma, Geneva, sans-serif",
            "font-size" : this.tM * 2,
            "text-anchor" : "middle",
            "alignment-baseline" : "middle"
        });
    this.placeItems(s, g, css);
    this.setEvents();
};
Navi.prototype.placeItems = function(s, g, css) {
    var itm = null,
        iT = this.itemsT,
        iA = {
            "class" : "navi-item"
        },
        pA = {
            "d" : "",
            "class" : "navi-panel",
            "fill-opacity" : "0",
            "stroke" : "#DEDEDE",
            "stroke-width" : this.sW,
            "stroke-linecap" : "round",
            "stroke-linejoin" : "round",
            "stroke-dasharray" : "0," + 3*this.iW
        },
        pD = this.pD,
        aA = {
            "attributeName" : "stroke-dasharray",
            "attributeType" : "XML",
            "begin" : "0s",
            "dur" : "1s",
            "fill" : "freeze",
            "from" : pA['stroke-dasharray'],
            "to" : (function(s) {
                var a = s.split(',');
                a[0] = a[1];
                return a.join(',');
            })(pA['stroke-dasharray']),
            "onend" : "\
                $(this).trigger('itemReady');\
                this.setAttribute('onend', '');"
        },
        tA = {
            "class" : "navi-text",
            "fill" : "#DDD",
            "mask" : "url(#msk)"
        };
    for (var i = 0, l = this.iC, id = '', p = null, x = 0; i < l; ++i) {
        id = 'navi-' + iT[i].toLowerCase();
        x = this.pL + i * this.iW;
        iA['id'] = id;
        tA['text'] = iT[i];
        tA['x'] = this.tL + i*this.iW - 2*this.tM;
        tA['y'] = this.tT + this.tM;
        iA['style'] = 'transform-origin: ' + tA['x'] + 'px ' + tA['y'] + 'px 0px';
        if (i == 0) {
            p = pD['first'];
        }
        else if (i == l-1) {
            p = pD['last'];
        }
        else {
            p = pD['middle'];
        }
        p.setX(0, x);
        pA['d'] = p.str();
        css.addRule('#'+id+'.chosen', {
            "transform" : "translate(" + String(-x) + "px, 70px) rotate(360deg)"
        });
        this.items[id] = itm = s.addNode(g, 'g', iA);
        p = this.panels[id] = s.addNode(itm, 'path', pA);
        s.addNode(p, 'animate', aA);
        s.addNode(p, 'animate', {
            "attributeName" : "fill-opacity",
            "attributeType" : "XML",
            "begin" : "1s",
            "dur" : "1s",
            "fill" : "freeze",
            "from" : "0",
            "to" : "1"
        });
        this.text[id] = s.addNode(itm, 'text', tA);
    }
};
Navi.prototype.setEvents = function() {
    var self = this,
        s = this.svg,
        list = this.list,
        items = this.items,
        pnls = this.panels,
        txt = this.text,
        pF = this.pFill,
        tF = this.tFill,
        h = this.handlers,
        id = '',
        hovered = false;
    h['click'] = function(e) {
        id = this.getAttribute('id');
        self.choose(id);
        hovered = false;
        $(this).trigger('goTo', id.split('navi-')[1]);
    };
    h['mouseenter'] = function(e) {
        if (hovered) return;
        hovered = true;
        id = this.getAttribute('id');
        items[id].addClass('hovered')
            .appendTo(list);
        pnls[id].addClass('hovered');
        txt[id].addClass('hovered');
    };
    h['mouseleave'] = function(e) {
        if (!hovered) return;
        hovered = false;
        items[id].rmvClass('hovered');
        pnls[id].rmvClass('hovered');
        txt[id].rmvClass('hovered');
    };
    h['itemReady'] = function(e) {
        id = this.getAttribute('id');/*
        pnls[id].addClass('ready');
        txt[id].addClass('ready');*/
    };
    for (var k in items) {
        $(items[k].e).on(h);
    }
};
Navi.prototype.choose = function(id) {
    var ch = this.chosen,
        itm = this.items[id],
        pnl = this.panels[id],
        txt = this.text[id],
        h = this.handlers,
        ended = false;
    for (var k in ch) {
        ch[k].rmvClass('chosen');
    }
    if (ch['item']) {
        var old = $(ch['item'].e);
        old.on('transitionend', function(e) {
            if (ended) return;
            ended = true;
            old.off('transitionend').on(h);
        });
    }
    $(itm.e).off(h);
    ch['item'] = itm.rmvClass('hovered').addClass('chosen');
    ch['panel'] = pnl.rmvClass('hovered').addClass('chosen');
    ch['text'] = txt.rmvClass('hovered').addClass('chosen');
};
Navi.prototype.to = function(id) {
  $('#navi-'+id).trigger('click');
};
