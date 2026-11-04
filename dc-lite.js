/* Умняша: маленький движок страницы.
   Шаблон — обычная разметка с подстановками {{путь}}, циклами <sc-for list as>, условиями <sc-if value>
   и обработчиками onClick / onChange / onSubmit. Логика — класс Component extends DCLogic
   со state, setState() и renderVals(). После каждого setState страница пересобирается
   и аккуратно «сшивается» с тем, что уже на экране, чтобы не сбивать анимации и ввод. */
(function () {
  'use strict';
  var HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g;
  var ONE = /^\{\{\s*([\w.$]+)\s*\}\}$/;
  var BOOL = { disabled: 1, checked: 1, selected: 1, hidden: 1, readonly: 1, required: 1, multiple: 1 };
  var EVENTS = { onclick: 'click', onchange: 'change', oninput: 'input', onsubmit: 'submit', onkeydown: 'keydown' };
  var TYPING = { text: 1, email: 1, password: 1, search: 1, tel: 1, url: 1, number: 1 };

  function get(scope, path) {
    var parts = path.split('.'), v = scope[parts[0]];
    for (var i = 1; i < parts.length && v != null; i++) v = v[parts[i]];
    return v;
  }
  function str(v) { return v == null ? '' : String(v); }
  function fill(text, scope) { return text.replace(HOLE, function (_, p) { return str(get(scope, p)); }); }
  function raw(text, scope) { var m = ONE.exec(text.trim()); return m ? get(scope, m[1]) : fill(text, scope); }

  function renderChildren(tpl, scope, out) {
    for (var n = tpl.firstChild; n; n = n.nextSibling) renderNode(n, scope, out);
  }
  function renderNode(n, scope, out) {
    if (n.nodeType === 3) {
      var t = n.nodeValue;
      out.appendChild(document.createTextNode(t.indexOf('{{') < 0 ? t : fill(t, scope)));
      return;
    }
    if (n.nodeType !== 1) return;
    var tag = n.localName;
    if (tag === 'sc-for') {
      var list = raw(n.getAttribute('list') || '', scope), as = n.getAttribute('as') || 'item';
      if (list && list.length) for (var i = 0; i < list.length; i++) {
        var s = Object.create(scope); s[as] = list[i]; renderChildren(n, s, out);
      }
      return;
    }
    if (tag === 'sc-if') {
      if (raw(n.getAttribute('value') || '', scope)) renderChildren(n, scope, out);
      return;
    }
    var el = n.cloneNode(false);
    for (var a = n.attributes.length - 1; a >= 0; a--) {
      var at = n.attributes[a], name = at.name, val = at.value;
      if (name.indexOf('hint-') === 0) { el.removeAttribute(name); continue; }
      if (EVENTS[name]) {
        el.removeAttribute(name);
        var fn = raw(val, scope);
        if (typeof fn === 'function') {
          var type = EVENTS[name];
          // как в React: onChange у текстового поля срабатывает на каждый ввод
          if (type === 'change' && (tag === 'textarea' || (tag === 'input' && TYPING[(n.getAttribute('type') || 'text').indexOf('{{') < 0 ? (n.getAttribute('type') || 'text') : 'text']))) type = 'input';
          (el._on || (el._on = {}))[type] = fn;
        }
        continue;
      }
      if (val.indexOf('{{') < 0) continue;
      if (BOOL[name]) { el.removeAttribute(name); if (raw(val, scope)) el.setAttribute(name, ''); continue; }
      var v = fill(val, scope);
      el.setAttribute(name, v);
      if (name === 'value' && (tag === 'input' || tag === 'textarea')) el._val = v;
    }
    renderChildren(n, scope, el);
    out.appendChild(el);
  }

  // сшивка: узлы на тех же местах обновляются, лишние убираются, новые добавляются
  function same(o, n) {
    return o.nodeType === n.nodeType && (o.nodeType !== 1 || (o.localName === n.localName && o.namespaceURI === n.namespaceURI));
  }
  function morph(op, np) {
    var o = op.firstChild, n = np.firstChild;
    while (n) {
      var next = n.nextSibling;
      if (!o) { op.appendChild(n); }
      else if (same(o, n)) { patch(o, n); o = o.nextSibling; }
      else { var on = o.nextSibling; op.replaceChild(n, o); o = on; }
      n = next;
    }
    while (o) { var x = o.nextSibling; op.removeChild(o); o = x; }
  }
  function patch(o, n) {
    if (o.nodeType === 3) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; return; }
    var i, at;
    for (i = o.attributes.length - 1; i >= 0; i--) { at = o.attributes[i]; if (!n.hasAttribute(at.name)) o.removeAttribute(at.name); }
    for (i = 0; i < n.attributes.length; i++) { at = n.attributes[i]; if (o.getAttribute(at.name) !== at.value) o.setAttribute(at.name, at.value); }
    o._on = n._on;
    if (o.localName === 'input' || o.localName === 'textarea') {
      if (o.type === 'checkbox' || o.type === 'radio') o.checked = n.hasAttribute('checked');
      else if (n._val !== undefined && o !== document.activeElement && o.value !== n._val) o.value = n._val;
    }
    morph(o, n);
  }

  function DCLogic(props) { this.props = props || {}; }
  DCLogic.prototype.setState = function (p) {
    if (typeof p === 'function') p = p(this.state);
    this.state = Object.assign({}, this.state, p);
    if (this._dirty) this._dirty();
  };

  function mount(Comp, root, tpl, props) {
    var c = new Comp(props || {}), queued = false;
    function render() {
      queued = false;
      var box = document.createElement('div');
      renderChildren(tpl.content, c.renderVals(), box);
      morph(root, box);
    }
    c._dirty = function () { if (!queued) { queued = true; Promise.resolve().then(render); } };
    ['click', 'input', 'change', 'submit', 'keydown'].forEach(function (type) {
      root.addEventListener(type, function (e) {
        for (var el = e.target; el && el !== root; el = el.parentNode) {
          if (el._on && el._on[type]) { el._on[type](e); return; }
        }
      });
    });
    render();
    if (c.componentDidMount) c.componentDidMount();
    return c;
  }

  window.DCLogic = DCLogic;
  window.DCLite = { mount: mount };
})();
