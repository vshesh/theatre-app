/**
This component should take in the script, currently selected line,
and blocking information and show the correct dots and arrows on the stage
image.
*/

// example of what blocking should look like
[
  {
    script_pos: [1,1,6,1,10],
    stage_pos: {'Theseus': [0.1, 0.2]}
  },
  {
  script_pos: [1,1,10,3,5],
  stage_pos: {
    'Theseus': [0.1, 0.2]
  }
}]

function StageDiagram() {
  return {
    view: (vnode) =>
      m('div.stage-diagram',
        m('img', {src: ''}),
        m('span.character', 'Theseus'))
  }
}
