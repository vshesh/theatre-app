import re

script = open("data/an_ideal_husband.txt")

# character list 

# characterName = '^\n\n([A-Z\s]+)(?<!MRS).'
characterName = '([A-Z]{2,}[(?,=MRS?)?\.][\s]*[A-Z]{2,})'
act = "ACT"
scene = "SCENE"
curtain = "CURTAIN"
stageDir = "\[[\w\s]\]"
# charactersInScene = 

#generate character list
characterNames = []
for line in script:
	r = re.findall(characterName, line)
	for name in r:
		if (name not in characterNames):
				characterNames.append(name)
				print line
				print name
print characterNames

firstLine = True
actList = []
sceneList = []
charDialogue = ()
dialogue = ""
allWords = []


for line in script:
	for word in line:
			if word is act:
				continue
			if word is scene:
				actList.append(sceneList)
				continue
			if word is characterName:
				if firstLine == true:
					charDialogue[1] = dialogue
					sceneList.append(charDialogue)
				else:
					firstLine = false
				charDialogue[0] = characterName
				continue
			else: 
				allWords.append(word)
				dialogue = dialogue + word

print actList












		
