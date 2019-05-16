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
  with open('data/measure.json') as f:
    play = t.merge(skeleton, {'script': json.load(f)})
    play['title'] = 'Measure for Measure'
    play['id'] = '1'
    play['author'] = 'William Shakespeare'
    play['characters'] = {
      'DUKE_VINCENTIO': {'name': 'Duke Vincentio', 'short_name': 'DV'},
      'ESCALUS': {'name': 'Escalus', 'short_name': 'E'},
      'ANGELO': {'name': 'Angelo', 'short_name': 'A'}
    }
    play['cues'] = {
      '0,0,0,0': [{'type': 'light', 'name': '1', 'message': 'Lights on!'}]
    }
    play['director_notes'] = {
      '0,0,0,0': [{'type': 'light', 'message': 'hello light people'}]
    }
    
    return play
  
staticroutestack(app, ['js', 'css', 'img'], 'client')

if __name__ == '__main__':
    run(app, host=('0.0.0.0' if os.environ.get('APP_LOCATION') == 'heroku' else "localhost"),
        port=( (len(sys.argv) > 1 and sys.argv[1]) or '8080'), debug=True)
