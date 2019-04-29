# play > act > scene > direction | speaking_block > lines > words


import re

script = open("data/cheat_an_ideal_husband.txt")


characterList = ['MRS.MARCHMONT.', 'LADYBASILDON.', 'LORDCAVERSHAM.', 'LADYCHILTERN.', 'MABELCHILTERN.', 'MASON.', 'LADYMARKBY.', 'MRS.CHEVELEY.', 'VICOMTEDENANJAC.']
act = "ACT"
scene = "SCENE"
curtain = "CURTAIN"
# stageDir = '\[[\w\s]\]'


firstLine = True
firstScene = True
actList = []
sceneList = []
charDialogue = ["char", "dialogue"]
dialogue = ""
allWords = []

for line in script:
	words = str.split(line)
	for word in words:
		if word == "ACT":
			continue
		if word == "SCENE":
			if not firstScene:
				actList.append(list(sceneList))
			else:
				firstScene = False
			continue
		if (word in characterList):
			if firstLine == False:
				charDialogue[1] = dialogue
				sceneList.append(list(charDialogue))
				#print charDialogue
				#print sceneList
				dialogue = ""
			else:
				firstLine = False
			charDialogue[0] = word
			continue
		else: 
			allWords.append(word)
			dialogue = dialogue + " " + word
print (actList)




