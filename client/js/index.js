/**
play > act > scene > direction | speaking_block > lines > words
*/

const script = {
  title: "An Ideal Husband",
  author: "Oscar Wilde",
  date: "1895-02-03",
  characters: {
    'Theseus': 'Lexi'
  },
  acts: [
    [[["MRS.MARCHMONT.", " Going on to the Hartlocks’ to-night, Margaret?"], ["LADYBASILDON.", " I suppose so. Are you?"], ["MRS.MARCHMONT.", " Yes. Horribly tedious parties they give, don’t they?"], ["LADYBASILDON.", " Horribly tedious! Never know why I go. Never know why I go anywhere."], ["MRS.MARCHMONT.", " I come here to be educated."], ["LADYBASILDON.", " Ah! I hate being educated!"], ["MRS.MARCHMONT.", " So do I. It puts one almost on a level with the commercial classes, doesn’t it? But dear Gertrude Chiltern is always telling me that I should have some serious purpose in life. So I come here to try to find one."], ["LADYBASILDON.", " I don’t see anybody here to-night whom one could possibly call a serious purpose. The man who took me in to dinner talked to me about his wife the whole time."], ["MRS.MARCHMONT.", " How very trivial of him!"], ["LADYBASILDON.", " Terribly trivial! What did your man talk about?"], ["MRS.MARCHMONT.", " About myself."], ["LADYBASILDON.", " And were you interested?"], ["MRS.MARCHMONT.", " Not in the smallest degree."], ["LADYBASILDON.", " What martyrs we are, dear Margaret!"], ["MRS.MARCHMONT.", " And how well it becomes us, Olivia!"], ["LORDCAVERSHAM.", " Good evening, LADYCHILTERN! Has my good-for-nothing young son been here?"], ["LADYCHILTERN.", " I don’t think Lord Goring has arrived yet."], ["MABELCHILTERN.", " Why do you call Lord Goring good-for-nothing?"], ["LORDCAVERSHAM.", " Because he leads such an idle life."], ["MABELCHILTERN.", " How can you say such a thing? Why, he rides in the Row at ten o’clock in the morning, goes to the Opera three times a week, changes his clothes at least five times a day, and dines out every night of the season. You don’t call that leading an idle life, do you?"], ["LORDCAVERSHAM.", " You are a very charming young lady!"], ["MABELCHILTERN.", " How sweet of you to say that, LORDCAVERSHAM! Do come to us more often. You know we are always at home on Wednesdays, and you look so well with your star!"], ["LORDCAVERSHAM.", " Never go anywhere now. Sick of London Society. Shouldn’t mind being introduced to my own tailor; he always votes on the right side. But object strongly to being sent down to dinner with my wife’s milliner. Never could stand Lady Caversham’s bonnets."], ["MABELCHILTERN.", " Oh, I love London Society! I think it has immensely improved. It is entirely composed now of beautiful idiots and brilliant lunatics. Just what Society should be."], ["LORDCAVERSHAM.", " Hum! Which is Goring? Beautiful idiot, or the other thing?"], ["MABELCHILTERN.", " I have been obliged for the present to put Lord Goring into a class quite by himself. But he is developing charmingly!"], ["LORDCAVERSHAM.", " Into what?"], ["MABELCHILTERN.", " I hope to let you know very soon, LORDCAVERSHAM!"], ["MASON.", ""], ["LADYMARKBY.", ""], ["MRS.CHEVELEY.", ""], ["LADYMARKBY.", " Good evening, dear Gertrude! So kind of you to let me bring my friend,"], ["MRS.CHEVELEY.", " Two such charming women should know each other!"], ["LADYCHILTERN.", " I think Mrs. Cheveley and I have met before. I did not know she had married a second time."], ["LADYMARKBY.", " Ah, nowadays people marry as often as they can, don’t they? It is most fashionable. Dear Duchess, and how is the Duke? Brain still weak, I suppose? Well, that is only to be expected, is it not? His good father was just the same. There is nothing like race, is there?"], ["MRS.CHEVELEY.", " But have we really met before, LADYCHILTERN? I can’t remember where. I have been out of England for so long."], ["LADYCHILTERN.", " We were at school together,"], ["MRS.CHEVELEY.", ""], ["MRS.CHEVELEY.", " Indeed? I have forgotten all about my schooldays. I have a vague impression that they were detestable."], ["LADYCHILTERN.", " I am not surprised!"], ["MRS.CHEVELEY.", " Do you know, I am quite looking forward to meeting your clever husband,"], ["LADYCHILTERN.", " Since he has been at the Foreign Office, he has been so much talked of in Vienna. They actually succeed in spelling his name right in the newspapers. That in itself is fame, on the continent."], ["LADYCHILTERN.", " I hardly think there will be much in common between you and my husband, MRS.CHEVELEY!"], ["VICOMTEDENANJAC.", " Ah! chère Madame, queue surprise! I have not seen you since Berlin!"], ["MRS.CHEVELEY.", " Not since Berlin, Vicomte. Five years ago!"], ["VICOMTEDENANJAC.", " And you are younger and more beautiful than ever. How do you manage it?"], ["MRS.CHEVELEY.", " By making it a rule only to talk to perfectly charming people like yourself."], ["VICOMTEDENANJAC.", " Ah! you flatter me. You butter me, as they say here."], ["MRS.CHEVELEY.", " Do they say that here? How dreadful of them!"]]]
  ]
}

const posCompare = (a1, a2) => _.zip(a1, a2).map(([x1, x2]) => x1 === x2 ? 0 : x1 < x2 ? -1 : 1).reduce((ans, next) => ans !== 0 ? ans : next, 0);
const decodeArray = (s) => s.split(',').map(x => parseInt(x));
const cx = (classmap) => _.keys(_.pickBy((value, key) => _.isBoolean(value) && value, classmap)).join(',');
const maxCompare = (compare) => (l) => _.reduce((acc, next) => compare(acc, next) < 0 ? next : acc, _.head(l), _.tail(l));


function Word() {
  return {
    view: ({attrs: {word, onclick}}) =>
      m('span.word', word)
  }
}


function Line() {
  return {
    view: ({attrs: {state, actions, line, pos}}) =>
    line.length === 2
    ? m('p.line', {onclick: onclick, 'data-pos': pos, class: cx({active: _.equals(state.active_line, pos), selected: _.equals(state.selected_line, pos)})}, m('span.character', line[0]), line[1])
    : m('p.direction', {onclick: onclick}, line[0])
  }
}


function Script() {
  return {
    view: (vnode) =>
    m('div.script', {onscroll: _.debounce(250, () => {
      const pos = [].slice.call(vnode.dom.children[1].children)
        .filter(line => line.getBoundingClientRect().y > vnode.dom.getBoundingClientRect().y)[0]
        .attributes['data-pos'].value.split(',').map(x => parseInt(x));
      vnode.attrs.actions.active_line.update(pos);
    })},
      m('div.title', vnode.attrs.script.title, ' by ', vnode.attrs.script.author),
      vnode.attrs.script.acts.map((act, a) =>
        m('div.act', act.map((scene, sc) => scene.map((line, l) =>
          m(Line, {state: vnode.attrs.state, actions: vnode.attrs.actions, line, pos: [a, sc, l], onclick: () => vnode.attrs.actions.selected_line.update([a, sc, l]) }) )) ))
    )
  }
}


function StageDiagram() {
  let draggable = null;
  
  function characterMap(line, blocking) {
    return !line ? {} : _.flow([
      _.toPairs,
      _.map( ([k,v]) => [decodeArray(k), v]),
      _.filter( ([k,v]) => posCompare(k, line) <= 0),
      maxCompare((x,y) => posCompare(x[0], y[0])),
      _.last
    ])(blocking);
  }
  
  return {
    onupdate: (vnode) => {
      delete draggable;
      draggable = interact('.stage-diagram .character')
        .draggable({
          onend: function(e) {
            let rect = interact.getElementRect(e.target.parentNode);
            let value = [(e.pageX - rect.left)/rect.width, (e.pageY - rect.top)/rect.height];
            console.log('drag finished', vnode.attrs.line, e.target, value);
            vnode.attrs.actions.blocking.update(vnode.attrs.line, Object.assign({}, characterMap(vnode.attrs.line, vnode.attrs.blocking), {[e.target.title]: value}));
          },
          onmove: function(e) {
            
          },
          modifiers: [
            interact.modifiers.restrict({
              restriction: "parent",
              endOnly: true,
              elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            }),
          ]
        });
    },
    onremove: () => {
      delete draggable;
    },
    view: ({attrs: {line, blocking}}) => {
      console.log('stage-diagram view: ', line, blocking);
      const b = characterMap(line, blocking);
      console.log('b: ', b);
      return m('div.stage-diagram',
        m('div.img-container',
          m('img.diagram', {src: 'img/img.png'}),
          _.toPairs(b).map(item =>
            m('span.character', {title: item[0], style: {left: `${100*item[1][0]}%`, top: `${100*item[1][1]}%`}}, item[0].slice(0,2)))
        ),
        m('div.character-selector')
      );
    }
  }
}


const App = {
  view: ({attrs: {state, actions, script}}) =>
    m('div.app',
      m(StageDiagram, {line: state.active_line, blocking: state.blocking, actions}),
      m(Script, {script, state, actions}))
}

const SS = (f) => S(x => {f(x); return x;})

const app = {
  initial_state: {
    selected_line: null,
    active_line: null,
    cues: {},
    blocking: {
      '0,0,5': {
        'Mabel': [0.5, 0.5],
        'Caversham, Lord': [0.2, 0.3]
      }
    },
    notes: {},
    lines_missed: {}
  },
  actions: (update) => ({
    selected_line: {
      update: (pos) => update({selected_line: pos})
    },
    active_line: {
      update: (pos) => update({active_line: pos})
    },
    blocking: {
      add: (pos) => update({blocking: SS(b => b.set(pos, {}))}),
      remove: (pos) => update({blocking: SS(b => b.delete(pos))}),
      update: (pos, characters) => update({blocking: PS({[pos]: PS(characters)})})
    }
  })
}

var update = m.stream();
var states = m.stream.scan(P, app.initial_state, update);
var actions = app.actions(update);

m.mount(document.getElementById('container'), {
  view: () => m(App, {script, state: states(), actions})
});
