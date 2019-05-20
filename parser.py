import regex as re
import simplejson as json


split_scene = lambda scene: re.split(re.compile(r'(?:\n\n+)|(?:\n\[)', re.MULTILINE), scene)[1:-1]
process_scene = lambda x: [None, [x.strip() if x.startswith('[') else '['+x.strip()]] if x.strip(
).endswith(']') else [x.split('\n')[0].strip().upper(), [y.strip() for y in x.split('\n')[1:]]]

if __name__ == '__main__':
  s = open('data/Measure.txt').read()
  acts = re.split(re.compile(r'^ACT \d$', re.MULTILINE), s)[1:]
  scenes = list(map(lambda a: re.split(re.compile('^SCENE \d$', re.MULTILINE), a)[1:], acts))
  print(json.dumps(list(map(lambda a: list(map(lambda x: list(map(process_scene, split_scene(x)
)), a)), scenes))))
  
