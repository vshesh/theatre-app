const iconName = (s) => (l => l.length == 1 ? l[0].slice(0,2) : l[0][0] + l[1][0])(s.split(' '));
const posCompare = (a1, a2) => _.zip(a1, a2).map(([x1, x2]) => !_.isNumber(x1) || !_.isNumber(x2) ? 0 : x1 === x2 ? 0 : x1 < x2 ? -1 : 1).reduce((ans, next) => ans !== 0 ? ans : next, 0);
const decodeArray = (s) => s.split(',').map(x => parseInt(x));
const cx = (classmap) => _.keys(_.pickBy((value, key) => _.isBoolean(value) && value, classmap)).join(' ');
const maxCompare = (compare) => (l) => _.reduce((acc, next) => compare(acc, next) < 0 ? next : acc, _.head(l), _.tail(l));


function Word() {
  return {
    view: ({attrs: {word, onclick}}) =>
      m('span.word', word)
  }
}


const Line = {
    view: ({attrs: {state, actions, line, pos}}) =>
    m('span.line', {'data-pos': pos, class: cx({active: state.display.stage && _.equals(state.active_line, pos)}) }, line)
}

const SpeakingBlock = {
  view: ({attrs: {state, actions, block, pos}}) => {
    return block.length === 1
    ? m('p.direction', m(Line, {state, actions, line: block[0], pos: [...pos, 0]}))
    : m('p.speaking-block', {'data-pos': pos}, m('span.character', state.play.characters[block[0]].name), block[1].map((line, l) => m(Line, {state, actions, line, pos: [...pos, l]})))
  }
}


const Script = {
    view: (vnode) => {
    const {attrs: {state, state: {play, play: {script}}, actions}} = vnode;
    return m('div.script', {onscroll: _.debounce(250, () => {
      const element = [].slice.call(vnode.dom.querySelectorAll('.line'))
        .filter(line => line.getBoundingClientRect().y > vnode.dom.getBoundingClientRect().y)[0];
      const pos = element.attributes['data-pos'].value.split(',').map(x => parseInt(x));
      actions.active_line.update(pos);
    })},
      m('div.title', script.title, ' by ', script.author),
      !!play && !_.equals(script, []) && script.map((act, a) =>
        m('div.act', act.map((scene, sc) => scene.map((block, l) =>
          m(SpeakingBlock, {state: state, actions: actions, block: block, pos: [a, sc, l]}) )) ))
    )
  }
}


function StageDiagram() {
  let active_line = null;
  let blocking = null;
  let draggable = interact('.stage-diagram .character');
  let dropzone = interact('.stage-diagram .img-container');
  let enterable = interact('.stage-diagram .benched-character');
  
  function characterMap(line, blocking) {
    return !line ? {} : _.omitBy(_.isUndefined, _.mapValues(_.flow([
      _.toPairs,
      _.map( ([k,v]) => [decodeArray(k), v]),
      _.filter( ([k,v]) => posCompare(k, line) <= 0 && posCompare(k, [line[0], line[1], 0, 0]) >= 0),
      maxCompare((x,y) => posCompare(x[0], y[0])),
      _.last
    ]), blocking));
  }
  draggable.draggable({
      onend: function(e) {
        let rect = interact.getElementRect(e.target.parentNode);
        let value = [(e.pageX - rect.left)/rect.width, (e.pageY - rect.top)/rect.height];
        console.log('drag finished', active_line, e.target.title, value);
        actions.blocking.update(e.target.title, active_line, value);
      },
      onmove: function(e) {
        let rect = interact.getElementRect(e.target.parentNode);
        let value = [(e.pageX - rect.left)/rect.width, (e.pageY - rect.top)/rect.height];
        e.target.style.left  = `${100*value[0]}%`;
        e.target.style.top = `${100*value[1]}%`;
      },
      modifiers: [
        interact.modifiers.restrict({
          restriction: "parent",
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        }),
      ]
    });
    dropzone.dropzone({
      accept: '.benched-character',
      overlap: 0.5,
      ondrop: function (e) {
        let dot = e.relatedTarget.getBoundingClientRect();
        let stage = e.target.getBoundingClientRect();
        console.log('in drop: ', dot, stage);
        let value = [(dot.x-stage.x)/stage.width, (dot.y-stage.y)/stage.height];
        console.log('drop!', e.relatedTarget.title, active_line, value);
        actions.blocking.update(e.relatedTarget.title, active_line, value)
        m.redraw();
      }
    });
    enterable.draggable({
      onmove: function(event) {
        var target = event.target,
          // keep the dragged position in the data-x/data-y attributes
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    
        // translate the element
        target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';
    
        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      },
      onend: function(event) {
        _.delay(50, () => event.target.style.webkitTransform = event.target.style.transform = "");
      }
    });
  return {
    onupdate: (vnode) => {
      active_line = vnode.attrs.line;
      blocking = vnode.attrs.play ? vnode.attrs.play.blocking : {};
      console.log('position tracking', active_line, blocking);
    },
    onremove: () => {
      delete draggable;
    },
    view: ({attrs: {line, blocking, characters}}) => {
      const b = characterMap(line, blocking);
      return m('div.stage-diagram',
        m('div.img-container',
          m('img.diagram', {src: 'img/img.png'}),
          _.toPairs(b).map(item =>
            m('span.character', {title: item[0], key: item[0], style: {left: `${100*item[1][0]}%`, top: `${100*item[1][1]}%`}}, characters[item[0]].short_name ))
        ),
        m('div.character-selector',
          _.toPairs(_.omitBy((value, key) => !b ? false : key in b, characters)).map(([key, value]) =>
          m('span.benched-character', {title: key, key: key}, characters[key].short_name )))
      );
    }
  }
}

const DisplayToggle = {
  view: ({attrs: {name, state, ontoggle}}) =>
    m('button', {onclick: ontoggle, class: cx({'active': state})}, name)
}

const ModeSelector = {
  view: ({attrs: {display, actions}}) =>
    m('div.mode-selector',
      m(DisplayToggle, {name: 'Stage', state: display.stage, ontoggle: actions.display.toggle_stage}),
      m(DisplayToggle, {name: 'Cues', state: display.cues, ontoggle: actions.display.toggle_cues}),
      m(DisplayToggle, {name: 'Line Notes', state: display.line_notes, ontoggle: actions.display.toggle_line_notes}),
      m(DisplayToggle, {name: 'Dir Notes', state: display.dir_notes, ontoggle: actions.display.toggle_dir_notes}))
}

const App = {
  view: ({attrs: {state, actions}}) =>
    m('div.app',
      m(ModeSelector, {display: state.display, actions}),
      state.display.stage && m(StageDiagram, {characters: state.play ? state.play.characters : {}, line: state.active_line, blocking: state.blocking, actions}),
      m(Script, {state, actions}))
}

const SS = (f) => S(x => {f(x); return x;})

const app = {
  initial_state: {
    display: {
      stage: true,
      cues: true,
      dir_notes: true,
      line_notes: false
    },
    active_line: [0,0,0,0],
    play: {
      script: [],
      characters: {},
      title: '',
      author: ''
    },
    blocking: {}
  },
  actions: (update) => ({
    receive_data: (play) => update({play: play}),
    display: {
      toggle_stage: () => update({display: PS({stage: S(v => !v)})}),
      toggle_cues: () => update({display: PS({cues: S(v => !v)})}),
      toggle_line_notes: () => update({display: PS({line_notes: S(v => !v)})}),
      toggle_dir_notes: () => update({display: PS({dir_notes: S(v => !v)})})
    },
    active_line: {
      update: (pos) => update({active_line: pos})
    },
    blocking: {
      update: (character, pos, value) => update({blocking: PS({[character]: {[pos]: value} }) })
    }
  })
}

var update = m.stream();
var states = m.stream.scan(P, app.initial_state, update);
var actions = app.actions(update);

m.request({method: 'GET', url: '/script'}).then((data) => actions.receive_data(data))

m.route(document.getElementById('container'), '/',  {
  '/': {view: () => m('div', 'TODO')},
  '/:id': {view: () => m(App, {state: states(), actions})},
});

meiosisTracer({streams: [states]});
