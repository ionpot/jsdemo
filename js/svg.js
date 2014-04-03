var SVG = {};

(function () {
    //"use strict";
    var ns = 'http://www.w3.org/2000/svg',
        xl = 'http://www.w3.org/1999/xlink',
        ver = '1.2';

    function Node(e) {
        this.e = e;
        this.classes = [];
        this.handlers = {};
    }
    Node.prototype.id = function () {
        return this.e.getAttribute('id');
    };
    Node.prototype.set = function (n, v) {
        if (!this.e) return;
        var args = [].slice.call(arguments);
        switch (args.length) {
            case 1:
                for (var k in n) {
                    this.attr(k, n[k]);
                }
                break;
            case 2:
                this.attr(n, v);
                break;
            default:
                break;
        }
        return this;
    };
    Node.prototype.attr = function (n, v) {
        var x = n.search('xlink') != -1,
            s = String(v);

        if (n == 'text') {
            var tn = document.createTextNode(s);
            this.e.appendChild(tn);
        }
        else if (n == 'class') {
            this.setClass(s);
        }
        else {
            this.e.setAttributeNS(x ? xl : null, n, s);
        }
    };
    Node.prototype.addClass = function (v) {
        if (this.hasClass(v)) return;
        var c = this.classes;
        c.push(v);
        this.e.setAttribute('class', c.join(' '));
        return this;
    };
    Node.prototype.setClass = function (v) {
        this.classes = v.split(' ');
        this.e.setAttribute('class', v);
        return this;
    };
    Node.prototype.hasClass = function (v) {
        var c = this.classes;
        for (var i = 0, l = c.length; i < l; ++i) {
            if (c[i] == v) return true;
        }
        return false;
    };
    Node.prototype.rmvClass = function (v) {
        var c = this.classes;
        for (var i = 0, l = c.length; i < l; ++i) {
            if (c[i] == v) {
                c.splice(i, 1);
                this.e.setAttribute('class', c.join(' '));
                break;
            }
        }
        return this;
    };
    Node.prototype.appendTo = function (p) {
        var e = p.e ? p.e : p;
        if (!e.appendChild) return;
        e.appendChild(this.e);
        return this;
    };
    Node.prototype.on = function (eTypes, eHandlers) {
        var e = this.e,
            h = this.handlers,
            a = arguments,
            l = a.length,
            eTs = null;
        if (l == 0) return;
        if (l == 1) {
            var o = a[0];
            for (var k in o) {
                this.addEvt(k, o[k]);
            }
            return;
        }
        eTs = a[0].split(' ');
        for (var i = 0, eT = '', eH = null, eTL = eTs.length; i < eTL; ++i) {
            eT = eTs[i];
            eH = a[i+1];
            this.addEvt(eT, eH);
        }
        return this;
    };
    Node.prototype.off = function (eTypes) {
        var e = this.e,
            h = this.handlers;
        if (typeof eTypes == 'string') {
            var eTs = eTypes.split(' ');
            for (var i = 0, l = eTs.length, eT = null; i < l; ++i) {
                eT = eTs[i];
                this.rmvEvt(eT);
            }
        } else {
            for (var k in eTypes) {
                this.rmvEvt(k, eTypes[k]);
            }
        }
        return this;
    };
    Node.prototype.addEvt = function (t, hn) {
        var e = this.e,
            h = this.handlers;
        if (h[t]) {
            e.removeEventListener(t, h[t]);
        }
        h[t] = hn;
        e.addEventListener(t, hn);
    };
    Node.prototype.rmvEvt = function (t, hn) {
        var e = this.e,
            h = this.handlers;
        if (!h[t]) return;
        e.removeEventListener(t, hn ? hn : h[t]);
        delete h[t];
    };

    function Element(w, h) {
        var s = document.createElementNS(ns, 'svg');
        s.setAttributeNS(null, 'version', ver);
        s.setAttributeNS(null, 'width', w ? String(w) : '100%');
        s.setAttributeNS(null, 'height', h ? String(h) : '100%');
        this.root = s;
    }
    Element.prototype.addNode = function (parent, name, attributes) {
        var args = [].slice.call(arguments),
            nd = null,
            c = args.length,
            p = null,
            n = '',
            a = {},
            e = null,
            x = false;
        if (c == 0) return;
        switch (c) {
            case 1:
                p = this.root;
                n = args[0];
                break;
            case 2:
                if (typeof args[0] == 'string') {
                    p = this.root;
                    n = args[0];
                    a = args[1];
                } else {
                    p = args[0];
                    n = args[1];
                }
                break;
            default:
                p = args[0];
                n = args[1];
                a = args[2];
        }
        e = document.createElementNS(ns, n);
        nd = new Node(e);
        nd.set(a);
        p = p.e ? p.e : p;
        p.appendChild(e);
        return nd;
    };

    function PDNode(x, y, c) {
        this.c = c || '';
        this.x = x || 0;
        this.y = y || 0;
    }
    PDNode.prototype.toString = function () {
        return this.c.concat(this.x, ',', this.y);
    };

    function PathData() {
        this.arr = [];
        this.len = 0;
        this.reset();
    }
    PathData.prototype.addX = function (i, x) {
        if (i >= this.len) return;
        this.arr[i].x += x;
    };
    PathData.prototype.addY = function (i, y) {
        if (i >= this.len) return;
        this.arr[i].y += y;
    };
    PathData.prototype.setX = function (i, x) {
        if (i >= this.len) return;
        this.arr[i].x = x;
    };
    PathData.prototype.setY = function (i, y) {
        if (i >= this.len) return;
        this.arr[i].y = y;
    };
    PathData.prototype.str = function () {
        return this.arr.join(' ') + 'z';
    };
    PathData.prototype.reset = function () {
        this.arr = [
            new PDNode(0, 0, 'M'),
            new PDNode(0, 0, 'l'),
            new PDNode(0, 0),
            new PDNode(0, 0),
            new PDNode(0, 0)
        ];
        this.len = this.arr.length;
    };

    SVG.Element = Element;
    SVG.PathData = PathData;
}());
