import os
import sys
from bottle import run, Bottle, static_file, request
from server.params import params, jsonabort
from server.staticroute import staticroutestack
import toolz as t
import simplejson as json

db = json.load(open('data/db.json'))

# all the fields present in a production
skeleton = {
  # constant fields (don't get updated)
  'title': '',
  'author': '',
  'characters': {},
  'script': [],
  # modifiable fields - can change these fields.
  'blocking': {},
  'cues': {},
  'line_notes': {},
  'director_notes': {},
}

app = Bottle()

@app.get('/')
def index():
  return static_file('index.html', 'client')

@app.get('/productions')
def all_productions():
  return {k:t.get(['id', 'name'], db[k]) for k in db}

@app.get('/production/:pid')
def read_production(pid):
  return db[pid]

@app.route('/production/:pid', method=['PUT', 'PATCH'])
@params(['data'])
def update_production(pid, data):
  db[pid] = t.merge(db.get(pid, {}), data, {'id': pid})
  with open('data/db.json', 'w') as dbfile:
    dbfile.write(json.dumps(db, indent='  '))
  return db[pid]

@app.post('/production')
@params(['data'])
def create_production(data):
  db[hash(data['name'])] = t.merge(skeleton, data, {'id': hash(data['name'])})
  return {'success': True}

@app.get('/script')
def get_script():
  return db["1"]
  # with open('data/measure.json') as f:
  #   play = t.merge(skeleton, {'script': json.load(f)})
  #   play['title'] = 'Measure for Measure'
  #   play['id'] = '1'
  #   play['author'] = 'William Shakespeare'
  #   play['characters'] = {
  #     'DUKE_VINCENTIO': {'name': 'Duke Vincentio', 'short_name': 'DV'},
  #     'ESCALUS': {'name': 'Escalus', 'short_name': 'E'},
  #     'ANGELO': {'name': 'Angelo', 'short_name': 'A'},
  #     'LUCIO': {'name': 'Lucio', 'short_name': 'LU'},
  #     'FIRST_GENTLEMAN': {'name': 'First Gentleman', 'short_name': '1G'},
  #     'SECOND_GENTLEMAN': {'name': 'Second Gentleman', 'short_name': '2G'},
  #     'MISTRESS_OVERDONE': {'name': 'Mistress Overdone', 'short_name': 'MO'},
  #     'POMPEY': {'name': 'Pompey', 'short_name': 'P'},
  #     'PROVOST': {'name': 'Provost', 'short_name': 'PR'},
  #     'CLAUDIO': {'name': "Claudio", 'short_name': 'CL'},
  #     'JULIET': {'name': "Juliet", 'short_name': 'J'},
  #     'FRIAR_THOMAS': {'name': "Friar Thomas", 'short_name': 'FT'},
  #     'ISABELLA': {'name': "Isabella", 'short_name': 'I'},
  #     'FRANCISCA': {'name': "Francisca", 'short_name': 'F'},
  #     'ELBOW': {'name': "Elbow", 'short_name': 'EL'},
  #     'FROTH': {'name': "Froth", 'short_name': 'FR'},
  #     'SERVANT': {'name': "Servant", 'short_name': 'S'},
  #     'LUKE': {'name': "Luke", 'short_name': 'LK'},
  #     'MARIANA': {'name': "Mariana", 'short_name': 'M'},
  #     'ABHORSON': {'name': "Abhorson", 'short_name': 'A'},
  #     'BARNARDINE': {'name': "Barnardine", 'short_name': 'B'},
  #     'FRIAR_PETER': {'name': "Friar Peter", 'short_name': 'FP'},
  #     'MESSENGER': {'name': 'Messenger', 'short_name': 'M'},
  #   }
  #   play['cues'] = {
  #     '0,0,0,0': [{'type': 'light', 'name': '1', 'message': 'Lights on!'}]
  #   }
  #   play['director_notes'] = {
  #     '0,0,0,0': [{'type': 'light', 'message': 'hello light people'}, {'type': 'line', 'message':'you missed this'}]
  #   }
  #
  #   return play
  
staticroutestack(app, ['js', 'css', 'img'], 'client')

if __name__ == '__main__':
    run(app, host=('0.0.0.0' if os.environ.get('APP_LOCATION') == 'heroku' else "localhost"),
        port=( (len(sys.argv) > 1 and sys.argv[1]) or '8080'), debug=True)
