const iconName = (s) => (l => l.length == 1 ? l[0].slice(0,2) : l[0][0] + l[1][0])(s.split(' '));
const posCompare = (a1, a2) => _.zip(a1, a2).map(([x1, x2]) => !_.isNumber(x1) || !_.isNumber(x2) ? 0 : x1 === x2 ? 0 : x1 < x2 ? -1 : 1).reduce((ans, next) => ans !== 0 ? ans : next, 0);
const decodeArray = (s) => s.split(',').map(x => parseInt(x));
const cx = (classmap) => _.keys(_.pickBy((value, key) => _.isBoolean(value) && value, classmap)).join(' ');
const maxCompare = (compare) => (l) => _.reduce((acc, next) => compare(acc, next) < 0 ? next : acc, _.head(l), _.tail(l));


const Modal = function() {
  let dom
  let children

  // Container component we mount to a root-level DOM node
  const ModalContainer = {
    view: () => children
  }

  return {
    oncreate(v) {
      children = v.children
      // Append a modal container to the end of body
      dom = document.createElement('div')
      // The modal class has a fade-in animation
      dom.className = 'modal-container'
      document.body.appendChild(dom)
      // Mount a separate VDOM tree here
      m.mount(dom, ModalContainer)
    },
    onbeforeupdate(v) {
      children = v.children
    },
    onbeforeremove() {
      // Add a class with fade-out exit animation
      dom.classList.add('hide');
      return new Promise(r => {
        dom.addEventListener('animationend', r)
      })
    },
    onremove() {
      // Destroy the modal dom tree. Using m.mount with
      // null triggers any modal children removal hooks.
      m.mount(dom, null)
      document.body.removeChild(dom)
    },
    view() {}
  }
}


const CueModal = {
  view: ({attrs: {actions, onclose, cue}}) =>
    m(Modal,
      m('div.modal.cue-modal',
        m('div.modal-header',
          m('div.modal-header-left',
          m('span.cue-type', cue.type, ' ', 'cue'),
          m('input.cue-name', {type: 'field', value:  cue.name})),
          m('button.pure-button.close-button', {onclick: onclose}, 'X')),
        m('textarea.cue-message', {value: cue.message}),
        m('div.modal-footer',
          m('button.warning.pure-button', 'Delete'),
          m('button.primary.pure-button', 'Save'))))
}


const NoteModal = {
  view: ({attrs: {actions, onclose, notes, pos}}) => {
    return m(Modal,
      m('div.modal.cue-modal',
        m('div.modal-header',
          m('div.modal-header-left',
          m('span.header', 'Comments')),
          m('button.pure-button.close-button', {onclick: onclose}, 'X')),
        m('div.notes', notes.map((note,i) =>
          m('div.note',
            m('span.cue-type',
              'Comment for ',
              m('select', {value: note.type, onchange: (v) => actions.notes.update(pos, i, {type: v.target.value})},
                m('option', {value: 'line'}, 'Line'),
                m('option', {value: 'actor'}, 'Actor'),
                m('option', {value: 'light'}, 'Lights'),
                m('option', {value: 'sound'}, 'Sound'),
                m('option', {value: 'props'}, 'Props'),
                m('option', {value: 'props'}, 'Costumes'),
                m('option', {value: 'set'}, 'Set'),
                m('option', {value: 'all cast'}, 'All Cast')),
            m('button.warning.pure-button', {onclick: () => actions.notes.remove(pos, i)}, 'Remove'),
          ),
          m('textarea.cue-message', {value: note.message, oninput: (e) => actions.notes.update(pos, i,  {message: e.target.value})}))),
        m('div.add-note',
          m('button.pure-button', {onclick: () => actions.notes.add(pos)}, '+Add another note'))
      ),
        m('div.modal-footer',
          m('button.primary.pure-button', {onclick: onclose}, 'Done')  )))
    }
}


function Line() {
  let lightModal = false;
  let noteModal = false;
  return {
    view: ({attrs: {state, actions, line, pos}}) => {
    const handleNoteModalOpen = () => {if (!(x => !!x && x.length > 0)(state.play.director_notes[pos])) { actions.notes.add(pos) } noteModal = true;};
    return m('span.line',
      {'data-pos': pos, class: cx({active: state.display.stage && _.equals(state.active_line, pos)}) },
      state.display.line_notes && m('span.line-note', {class: cx({active: state.play.line_notes[pos]}), onclick: () => {actions.line_notes.toggle(pos, !state.play.line_notes[pos]); /* after toggle the state is reversed */ state.play.line_notes[pos] && handleNoteModalOpen()} }),
      m('span.text', line /*.split(' ').map((w,i) => m(Word, {state, actions, word: w + ' ', pos: [...pos, i]}))*/ ),
      m('span.extras',
        state.display.stage && (_.map(x => pos in x, _.values(state.play.blocking)).reduce((acc,x)=> acc||x, false)) && m('span.blocking-mark', '\u00a0'),
        state.display.dir_notes && m('span.dir-note', {
          class: cx({active: (x => !!x && x.length > 0)(state.play.director_notes[pos])}),
          onclick: handleNoteModalOpen,
        }, (x => !!x && x.length > 0)(state.play.director_notes[pos]) ? '!' : '+'),
        noteModal && m(NoteModal, {actions: actions, onclose: () => {noteModal = false}, pos: pos, notes: state.play.director_notes[pos]}),
        false && state.display.cues && m('span.light-cue', {
          class: cx({active: !!state.play.cues[pos] && state.play.cues[pos].length > 0}),
          onclick: () => {lightModal = !lightModal}
        }, state.play.cues[pos] ? state.play.cues[pos][0].name : null,
        lightModal && m(CueModal, {actions: actions, onclose: () => {lightModal = false}, cue: state.play.cues[pos][0]})),
        false && state.display.cues && m('span.sound-cue', ' '))
    )}
  };
}


const SpeakingBlock = {
  view: ({attrs: {state, actions, block, pos}}) => {
    return block[0] === null
    ? m('p.direction', m(Line, {state, actions, line: block[1][0], pos: [...pos, 0]}))
    : m('p.speaking-block', {'data-pos': pos}, m('div.character', state.play.characters[block[0]].name), block[1].map((line, l) => m(Line, {state, actions, line, pos: [...pos, l]})))
  }
}


const Script = {
    view: (vnode) => {
    const {attrs: {state, state: {play, play: {script, title, author}}, actions}} = vnode;
    return m('div.script', {onscroll: _.debounce(250, () => {
      const element = [].slice.call(vnode.dom.querySelectorAll('.line'))
        .filter(line => line.getBoundingClientRect().y > vnode.dom.getBoundingClientRect().y)[0];
      const pos = element.attributes['data-pos'].value.split(',').map(x => parseInt(x));
      actions.active_line.update(pos);
    })},
      m('div.title', play.title, ' by ', play.author),
      !!play && script.map((act, a) =>
        m('div.act', act.map((scene, sc) => m('div.scene', m('div.scene-header', `Act ${a+1} Scene ${sc+1}`), scene.map((block, l) =>
          m(SpeakingBlock, {state: state, actions: actions, block: block, pos: [a, sc, l]}) )) ) )),
      m('div.buffer')
    )
  }
}


function characterMap(line, blocking) {
  return !line ? {} : _.omitBy(_.isUndefined, _.mapValues(_.flow([
    _.toPairs,
    _.map( ([k,v]) => [decodeArray(k), v]),
    _.filter( ([k,v]) => posCompare(k, line) <= 0 && posCompare(k, [line[0], line[1], 0, 0]) >= 0),
    maxCompare((x,y) => posCompare(x[0], y[0])),
    _.last,
    x => x === null ? undefined : x
  ]), blocking));
}


function StageDiagram() {
  let active_line = null;
  let blocking = null;
  let draggable = interact('.stage-diagram .character');
  let dropzone = interact('.stage-diagram .img-container');
  let enterable = interact('.stage-diagram .benched-character');
  let benchzone = interact('.stage-diagram .character-selector');
  
  benchzone.dropzone({
    accept: '.character',
    overlap: 0.5,
    ondrop: function(e) {
      console.log('benched!', e.relatedTarget.title);
      let dot = e.relatedTarget.title;
      actions.blocking.update(dot, active_line, !characterMap([...(active_line.slice(0,3)), active_line[3]-1], blocking)[e.relatedTarget.title] ? D : null);
      m.redraw();
    }
  })
  
  draggable.draggable({
      onend: function(e) {
        let rect = interact.getElementRect(e.target.parentNode);
        let value = [(e.pageX - rect.left)/rect.width, (e.pageY - rect.top)/rect.height];
        actions.blocking.update(e.target.title, active_line, value);
      },
      onmove: function(e) {
        let rect = interact.getElementRect(e.target.parentNode);
        let value = [(e.pageX - rect.left)/rect.width, (e.pageY - rect.top)/rect.height];
        e.target.style.left  = `${100*value[0]}%`;
        e.target.style.top = `${100*value[1]}%`;
      }
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
        target.style.left = `${x}px`;
        target.style.top = `${y}px`;
    
        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
      },
      onend: function(event) {
        event.target.setAttribute('data-x', 0);
        event.target.setAttribute('data-y', 0);
        _.delay(100, () => event.target.style.webkitTransform = event.target.style.transform = "");
      }
    });
  return {
    oncreate: (vnode) => {
      vnode.dom.querySelector('.character-selector').setAttribute('style', `height: ${vnode.dom.querySelector('.diagram').clientHeight}px`)
    },
    onupdate: (vnode) => {
      active_line = vnode.attrs.line;
      blocking = vnode.attrs.play ? vnode.attrs.play.blocking : {};
      vnode.dom.querySelector('.character-selector').setAttribute('style', `height: ${vnode.dom.querySelector('.diagram').clientHeight}px`)
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
    m('button.pure-button', {onclick: ontoggle, class: cx({'active': state})}, (state? 'Hide ' : 'Show ' )+ name)
}

const ModeSelector = {
  view: ({attrs: {display, actions}}) =>
    m('div.mode-selector',
      m(DisplayToggle, {name: 'Stage', state: display.stage, ontoggle: actions.display.toggle_stage}),
      false && m(DisplayToggle, {name: 'Cues', state: display.cues, ontoggle: actions.display.toggle_cues}),
      m(DisplayToggle, {name: 'Line Notes', state: display.line_notes, ontoggle: actions.display.toggle_line_notes}),
      m(DisplayToggle, {name: 'Comments', state: display.dir_notes, ontoggle: actions.display.toggle_dir_notes}))
}

const ConfirmClearModal = {
  view: ({attrs: {state, actions, onclose}}) =>
    m(Modal, m('div.confirm-clear-modal.modal',
      'Are you sure that you want to clear all the line notes?',
      m('div.button-bar',
        m('button.pure-button', {onclick: onclose}, 'Cancel & Return'),
        m('button.pure-button.warning', {onclick: () => {actions.line_notes.clear(); onclose()}}, 'Clear Line Notes'))))
}
const contains = (x, l) => _.indexOf(x, l) >= 0;
const generateEmail = (script, comments) =>
  _.flow([
    _.pickBy(_.identity),
    x => _.merge(x, _.pickBy(v => contains('line', _.pluck('type', v)), comments)),
    _.tap(x => console.log('merged', x)),
    _.keys,
    _.map(decodeArray),
    _.map(x => [
      _.get(x.slice(0,3), script)[0],
      x[0]+1,
      x[1]+1,
      _.get([...(x.slice(0,3)), 1, x[3]], script),
      _.pluck('message', _.filter(x => x.type === 'line', _.get(`${x}`, comments))).join('\n'),
      _.pluck('message', _.filter(x => x.type === 'actor', _.get(`${x}`, comments))).join('\n')
    ]),
    _.groupBy(_.head),
    _.mapValues(_.map(_.tail)),
    _.mapValues(_.sortBy(_.slice(0,2))),
   _.mapValues(_.map(v => m('tr.email-row', _.map(x => m('td', x), v))))
  ]);

const EmailModal = {
  view: ({attrs: {state : {play, play: {script, director_notes, line_notes}}, actions, onclose}}) =>
    m(Modal,
      m('div.modal.email-modal',
        'You can see your missed lines in context here: ',
        m('a', {href: 'https://theatrem.herokuapp.com'}, 'https://theatrem.herokuapp.com/#!/1'),
        _.toPairs(generateEmail(script, director_notes)(line_notes)).map(([k,v]) =>
          m('div.character',
            m('div.name', play.characters[k] ? play.characters[k].name : 'Stage Directions'),
            m('table', m('thead', m('tr', m('th', 'Act'), m('th', 'Scene'), m('th', 'Text'), m('th', 'SM Comments'), m('th', 'From Director'))), v))),
        
        m('button.pure-button', {onclick: onclose}, 'Close')
      ))
}

function AppFooter() {
  emailModal = false;
  clearModal = false;
  return {
    view: ({attrs: {state, actions}}) =>
      m('div.footer',
        m('button.pure-button', {onclick: () => emailModal = true}, 'Generate Line Notes Email'),
        m('button.pure-button', {onclick: () => clearModal = true}, 'Clear all line notes'),
        clearModal && m(ConfirmClearModal, {state, actions, onclose: () => {clearModal = false}}),
        emailModal && m(EmailModal, {state, actions, onclose: () => {emailModal = false}}))
  }
}

const App = {
  view: ({attrs: {state, actions}}) =>
    m('div.app',
      m(ModeSelector, {display: state.display, actions}),
      state.display.stage && m(StageDiagram, {characters: state.play ? state.play.characters : {}, line: state.active_line, blocking: state.play.blocking, actions}),
      m(Script, {state, actions}),
      state.display.line_notes && m(AppFooter, {actions, state})
    )
}


const e = (category, action, label, value) => ga('send', 'event', category, action, label, value)


const app = {
  initial_state: {
    display: {
      stage: true,
      cues: true,
      dir_notes: true,
      line_notes: true
    },
    active_line: [0,0,0,0],
    play: {
      script: [],
      characters: {},
      title: '',
      author: '',
      line_notes: {},
      blocking: {}
    }
  },
  actions: (update) => ({
    receive_data: (play) => update({play: play}),
    line_notes: {
      clear: () => {e('line-notes', 'clear'); return update({play: PS({line_notes: {}})})},
      toggle: (pos, v) =>{e('line-notes', 'toggle', pos.toString(), v ? 1 : 0); return update({play: PS({line_notes: PS({[pos]: v})})})}
    },
    notes: {
      add: (pos) => {e('comments', 'add', pos.toString()); return update({play: PS({director_notes: PS({[pos]: S(a => [].concat(a ? a : [], [{type: 'line', message: ''}]))})})})},
      remove: (pos, i) => {e('comments', 'remove', `${pos}`, i); return update({play: PS({director_notes: PS({[pos]: S(a => [].concat(_.slice(0,i,a), a.slice(i+1)))})})})},
      update: (pos, i, d) => {
        e('comments', 'update', `${Object.keys(d)[0]} @ ${pos}`, i);
        return update({play: PS({director_notes: PS({[pos]:  S(a => {console.log(_.slice(0,i,a), a.slice(i+1)); return [].concat(_.slice(0,i,a), P(a[i], d), a.slice(i+1))} ) }) })}) }
    },
    display: {
      toggle_stage: () => {e('display', 'toggle', 'stage', !states().display.stage); return update({display: PS({stage: S(v => !v)})})},
      toggle_cues: () => {e('display', 'toggle', 'cues', !states().display.stage); return update({display: PS({cues: S(v => !v)})})},
      toggle_line_notes: () => {e('display', 'toggle', 'line-notes', !states().display.stage); return update({display: PS({line_notes: S(v => !v)})})},
      toggle_dir_notes: () => {e('display', 'toggle', 'comments', !states().display.stage); return update({display: PS({dir_notes: S(v => !v)})})}
    },
    active_line: {
      update: (pos) => update({active_line: pos})
    },
    blocking: {
      update: (character, pos, value) => {e('blocking', `update - ${character}`, `${pos}`, Math.trunc(value[0]*100)); return update({play: PS({blocking: PS({[character]: PS({[pos]: value}) }) }) })}
    }
  })
}

let update = m.stream();
let states = m.stream.scan(P, app.initial_state, update);
let actions = app.actions(update);

function unique(s) {
  let previous = null;
  return s.map(v => {
    if (previous !== null && _.isEqual(v, previous)) return m.stream.SKIP;
    previous = _.cloneDeep(v);
    return v;
  });
}

unique(states.map(s => s.play)).map(p =>
  p.id && m.request({
    method: 'PUT',
    url: `/production/${p.id}`,
    data: {data: p}
  })
);

m.request({method: 'GET', url: '/script'}).then((data) => actions.receive_data(data))

m.route(document.getElementById('container'), '/',  {
  '/': {view: () => m('div', 'TODO')},
  '/:id': {view: () => m(App, {state: states(), actions})},
});

meiosisTracer({streams: [states]});
