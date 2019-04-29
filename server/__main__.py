from bottle import run, Bottle, static_file
from server.params import params, jsonabort
from server.staticroute import staticroutestack
import toolz as t

app = Bottle()

@app.get('/')
def index():
  return static_file('index.html', 'client')

staticroutestack(app, ['js', 'css', 'img'], 'client')


if __name__ == '__main__':
  run(app, host="localhost", port='8080', debug=True)
