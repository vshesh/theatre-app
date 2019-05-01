/**
This component should take in the script, currently selected line,
and blocking information and show the correct dots and arrows on the stage
image.
*/

// example of what blocking should look like
[
  {
    script_pos: [1,1,6,1,10],
    stage_pos: {
      'Theseus': [0.1, 0.2]
    }
  },{
  script_pos: [1,1,10,3,5],
  stage_pos: {
    'Theseus': [0.3, 0.2]
  }
}]

function StageDiagram() {
  return {
    view: ({attrs: {line, blocking}}) =>
      return m('div.stage-diagram',
        m('img', {src: 'data/img.png'}),
        m('span.character', {style: {top: "10%", left: "20%"}}))
  }
}

// how do i take in blocking array and string?

function getPositionInScript(line, blocking) {
  var positionData = {};
  var i;
  for (i = 0; i < blocking.length; i++) {
    positionData = blocking[i];
    scriptPos = positionData[script_pos];
    if (scriptPos[0] == line[0]) {
      if (scriptPos[1] == line[1]) {
        if (scriptPos[2] == line[2]) {            
          if (scriptPos[3] == line[3]) {
            if (scriptPos[4] == line[4]) {
              if (scriptPos[5] == line[5]) {
                return positionData;
              }
              if (scriptPos[5] > line[5]) {
                return blocking[i-1];
              }
            }
            if (scriptPos[4] > line[4]) {
              return blocking[i-1];
            }
          }
          if (scriptPos[3] > line[3]) {
            return blocking[i-1];
          }
        }
        if (scriptPos[2] > line[2]) {
          return blocking[i-1];
        }
      }
      if (scriptPos[1] > line[1]) {
        return blocking[i-1];
      }
    }
    if (scriptPos[0] > line[0]) {
      return blocking[i-1];
    }
  }
}