from bottle import run, Bottle, static_file
from server.params import params, jsonabort
from server.staticroute import staticroutestack
import toolz as t
import simplejson as json

db = json.load(open('data/db.json'))

# all the fields present in a production
skeleton = {
  'script': [],
  'blocking': {},
  'characters': {},
  'cues': {},
  'line_notes': {},
  'director_notes': {},
  'title': '',
  'author': ''
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

staticroutestack(app, ['js', 'css', 'img'], 'client')

if __name__ == '__main__':
  run(app, host="localhost", port='8080', debug=True)
