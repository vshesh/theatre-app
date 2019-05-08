from bottle import run, Bottle, static_file
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

@params(['data'])
@app.route('/production/:pid', method=['PUT', 'PATCH'])
def update_production(pid, data):
  db[pid] = t.merge(db[pid], data, {'id': pid})
  return db[pid]

@params(['data'])
@app.post('/production')
def create_production(data):
  db[hash(data['name'])] = t.merge(skeleton, data, {'id': hash(data['name'])})
  return {'success': True}

@app.get('/script')
def get_script():
  play = t.merge(skeleton, {'script': json.load(open('data/measure.json'))})
  play['title'] = 'Measure for Measure'
  play['author'] = 'William Shakespeare'
  play['characters'] = {
    'DUKE_VINCENTIO': {'name': 'Duke Vincentio', 'short_name': 'DV'},
    'ESCALUS': {'name': 'Escalus', 'short_name': 'E'},
    'ANGELO': {'name': 'Angelo', 'short_name': 'A'}
  }
  
  return play
  
  
staticroutestack(app, ['js', 'css', 'img'], 'client')

if __name__ == '__main__':
  run(app, host="localhost", port='8080', debug=True)
