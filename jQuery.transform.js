(function ($) {

    var identity_matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    //Mathematical section, which basically is reduced to matrix multiplication
    Transformation = function () {
        var matrix = identity_matrix;
        this.getMatrix = function () { return matrix; };
        this.setMatrix = function (m) { matrix = m; };

        function multiply_matrix(m, n) {
            var r = [];
            r[0] = m[0] * n[0] + m[1] * n[4] + m[2] * n[8] + m[3] * n[12];
            r[1] = m[0] * n[1] + m[1] * n[5] + m[2] * n[9] + m[3] * n[13];
            r[2] = m[0] * n[2] + m[1] * n[6] + m[2] * n[10] + m[3] * n[14];
            r[3] = m[0] * n[3] + m[1] * n[7] + m[2] * n[11] + m[3] * n[15];
            r[4] = m[4] * n[0] + m[5] * n[4] + m[6] * n[8] + m[7] * n[12];
            r[5] = m[4] * n[1] + m[5] * n[5] + m[6] * n[9] + m[7] * n[13];
            r[6] = m[4] * n[2] + m[5] * n[6] + m[6] * n[10] + m[7] * n[14];
            r[7] = m[4] * n[3] + m[5] * n[7] + m[6] * n[11] + m[7] * n[15];
            r[8] = m[8] * n[0] + m[9] * n[4] + m[10] * n[8] + m[11] * n[12];
            r[9] = m[8] * n[1] + m[9] * n[5] + m[10] * n[9] + m[11] * n[13];
            r[10] = m[8] * n[2] + m[9] * n[6] + m[10] * n[10] + m[11] * n[14];
            r[11] = m[8] * n[3] + m[9] * n[7] + m[10] * n[11] + m[11] * n[15];
            r[12] = m[12] * n[0] + m[13] * n[4] + m[14] * n[8] + m[15] * n[12];
            r[13] = m[12] * n[1] + m[13] * n[5] + m[14] * n[9] + m[15] * n[13];
            r[14] = m[12] * n[2] + m[13] * n[6] + m[14] * n[10] + m[15] * n[14];
            r[15] = m[12] * n[3] + m[13] * n[7] + m[14] * n[11] + m[15] * n[15];
            return r;
        }

        function multiply_vector(m, v) {
            var r = [];
            r[0] = m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3];
            r[1] = m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3];
            r[2] = m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3];
            r[3] = m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3];
            return r;
        }

        this.applyTransformation = function (t, o) {
            o = o || [0, 0];
            var trans = !(o[0] == 0 && o[1] == 0);
            if (trans) this.translate(-o[0], -o[1], 0);
            matrix = multiply_matrix(t, matrix);
            if (trans) this.translate(o[0], o[1], 0);
        }

        this.flatten = function () { matrix[8] = 0; matrix[9] = 0; matrix[10] = 0; matrix[11] = 0; matrix[2] = 0; matrix[6] = 0; matrix[14] = 0; }

        this.translate = function (tx, ty, tz) {
            if (tx == 0 && ty == 0 && tz == 0) return;
            this.applyTransformation(
                    [1, 0, 0, tx,
                    0, 1, 0, ty || 0,
                    0, 0, 1, tz || 0,
                    0, 0, 0, 1]);
        }

        this.perspective = function (length, o) {
            if (!length || length == 0) return;
            this.applyTransformation(
                    [1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, -1 / length, 1], o);
        }

        this.transformPoint = function (x, y, z) {
            z = z ? z : 0;
            var r = multiply_vector(matrix, [x, y, z, 1]);
            var w = r[3] == 0 ? 1 : r[3];
            $.each(r, function (idx, val) { r[idx] = r[idx] / w });
            return r;
        }
    }

    //Used to access CSS properties without dealing in browser specific prefixes and behavior
    CSSProperties = {
        transform: function (e) {
            var t;
            f = this.DXImageTransform(e);
            if (f) {
                t = 'matrix(' + f.M11 + ',' + f.M21 + ',' + f.M12 + ',' + f.M22 + ',' + f.Dx + ',' + f.Dy + ')';
            }
            else {
                t = e.css('-moz-transform') || e.css('-webkit-transform') || e.css('transform');
            }
            return t ? t : 'none';
        },
        DXImageTransform: function (e) {
            return e[0].filters && e[0].filters['DXImageTransform.Microsoft.Matrix'] ? e[0].filters['DXImageTransform.Microsoft.Matrix'] : null;
        },
        transformOrigin: function (e) {
            return this.getCoordinates(e.css('-moz-transform-origin') || e.css('-webkit-transform-origin') || e.css('transform-origin'));
        },
        perspective: function (e) {
            var p = e.css('-moz-perspective') || e.css('-webkit-perspective') || e.css('perspective');
            return (p && p != 'none') ? this.getCoordinates(p)[0] : null;
        },
        perspectiveOrigin: function (e) {
            return this.getCoordinates(e.css('-moz-perspective-origin') || e.css('-webkit-perspective-origin') || e.css('perspective-origin'));
        },
        preserve3D: function (e) {
            return (e.css('-moz-transform-style') || e.css('-webkit-transform-style') || e.css('transform-style')) == "preserve-3d";
        },
        getCoordinates: function (s) {
            if (!s) return [0, 0];
            var r = s.replace('px', '').split(' ');
            $.each(r, function (idx, val) { r[idx] = parseInt(val); });
            return r;
        }
    }

    //Object returned by plugin (violation of chainability)
    transform = function (wrappedset) {
        var ws = wrappedset;

        this.transformedRectangle = function () {
            var e = $(ws.get(0));
            if (CSSProperties.DXImageTransform(e)) {
                return { left: e.position().left, top: e.position().top, width: e.width(), height: e.height(), spin: false };
            }
            else {
                var t = getTransformation(e);
                var r = getCircumscribedRectangle(t, 0, 0, e.outerWidth(), e.outerHeight());
                var p = e.position();
                return { left: p.left, top: p.top, width: r[2] - r[0], height: r[3] - r[1], spin: getSpin(t) };
            }

            function getCircumscribedRectangle(t, x1, y1, x2, y2) {
                var cr = [];
                setEdge(cr, t.transformPoint(x1, y1, 0));
                setEdge(cr, t.transformPoint(x1, y2, 0));
                setEdge(cr, t.transformPoint(x2, y1, 0));
                setEdge(cr, t.transformPoint(x2, y2, 0));
                return cr;
            }

            function setEdge(Edge, Q) {
                if (Q[4] <= 0) return;
                Edge[0] = Edge[0] != undefined ? Math.min(Edge[0], Q[0]) : Q[0];
                Edge[1] = Edge[1] != undefined ? Math.min(Edge[1], Q[1]) : Q[1];
                Edge[2] = Edge[2] != undefined ? Math.max(Edge[2], Q[0]) : Q[0];
                Edge[3] = Edge[3] != undefined ? Math.max(Edge[3], Q[1]) : Q[1];
            }

            function getSpin(t) {
                var a = t.transformPoint(0, 0, 0);
                var b = t.transformPoint(100, 0, 0);
                var c = t.transformPoint(0, 100, 0);

                var r = (b[0] - a[0]) * (c[1] - a[1]);
                return r != 0 ? r < 0 : (b[1] - a[1]) * (c[0] - a[0]) < 0;
            }
        };

        this.transformedWidth = function () {
            return this.transformedRectangle().width;
        }
        this.transformedHeight = function () {
            return this.transformedRectangle().height;
        }

        function getTransformation(e) {

            var parents = $.grep(e.parents(), function (element) { return element.tagName != "HTML" && element.tagName != "BODY" });
            parents.reverse();
            parents.push(e[0]);

            var transformations = [];
            var preserve3D = true;
            var context3D = false;
            var perspective;
            var index = 0;
            $.each(parents, function (idx, val) {
                var $val = $(val);
                var tdef = {
                    matrix: getTransformMatrix($val),
                    origin: CSSProperties.transformOrigin($val),
                    offset: transformations.length == 0 ? [0, 0] : [val.offsetLeft, val.offsetTop],
                    flatten: !preserve3D
                };
                if (CSSProperties.perspective($val)) perspective = $val;
                if (tdef.matrix != identity_matrix) {
                    preserve3D = CSSProperties.preserve3D($val);
                    context3D = true;
                }
                if (context3D) transformations[index++] = tdef;
            });

            var t = new Transformation();
            $.each(transformations.reverse(), function (idx, val) {
                if (val.matrix != identity_matrix) {
                    t.applyTransformation(val.matrix, val.origin);
                    if (val.flatten) t.flatten();
                }
                t.translate(val.offset[0], val.offset[1]);
            });
            if (perspective) t.perspective(CSSProperties.perspective(perspective), CSSProperties.perspectiveOrigin(perspective));

            return t;
        };

        function getTransformMatrix(e) {
            var t = CSSProperties.transform(e);

            if (t == "none") return identity_matrix;
            var m3d = t.substring(6, 8) == '3d';
            t = t.substring(m3d ? 9 : 7, t.length - 1).split(',');
            $.each(t, function (idx, val) { t[idx] = parseFloat(val); });
            if (m3d) {
                return [t[0], t[4], t[8], t[12],
                        t[1], t[5], t[9], t[13],
                        t[2], t[6], t[10], t[14],
                        t[3], t[7], t[11], t[15]];
            }
            else {
                return [t[0], t[2], 0, t[4],
                        t[1], t[3], 0, t[5],
                        0, 0, 1, 0,
                        0, 0, 0, 1];
            }
        }
    };

    $.fn.transform = function () {
        return new transform(this);
    };
})(jQuery);
