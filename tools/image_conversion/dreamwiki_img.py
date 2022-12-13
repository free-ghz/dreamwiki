#!/usr/bin/python
# -*- coding: utf-8 -*-
from PIL import Image # pip install pillow
from PIL import ImageDraw
from random import randint
from random import uniform
from random import choice
from math import floor

# liten conf
pagewidth = 40
pixel_factor = 0.5 # since a pixel is square but a character is not

infile1 = Image.open("input.png")
infile = infile1.convert('RGB')
#rityta = ImageDraw.Draw(infile)
width, height = infile.size
pageheight = int(floor((height/width)*(pagewidth)*pixel_factor))

print("width: " + str(width))
print("height: " + str(height))

print("dw width: " + str(pagewidth))
print("dw height: " + str(pageheight))

# lumen friend
def lumen(r, g, b):
	rc = r/255
	rg = g/255
	rb = b/255
	l = (0.2126*rc) + (0.7152*rg) + (0.0722*rb)
	return l

tilewidth = width//pagewidth
tileheight = height//pageheight

margin = width - (tilewidth*pagewidth)
tilewidth += int(round(margin/pagewidth))


print("tile width: " + str(tilewidth))
print("tile height: " + str(tileheight))
print(str(tilewidth) + " * " + str(pagewidth) + " = " + str(tilewidth*pagewidth))
print(" ")

rad_values = [[0 for x in range(pagewidth)] for x in range(pageheight)]

for y in range(pageheight):
	for x in range(pagewidth):
		l = 0
		c = 0
		for j in range(tileheight):
			for i in range(tilewidth):
				if i+(x*tilewidth) < width and j+(y*tileheight) < height:
					r, g, b = infile.getpixel((i+(x*tilewidth),j+(y*tileheight)))
					l += lumen(r,g,b)
					c += 1
		if c == 0:
			rad_values[y][x] = 0
		else:
			rad_values[y][x] = round((l/c)*10)

for y in rad_values:
	z = ""
	for x in y:
		if int(x) != 10:
			z += str(int(x))
		else:
			z += " "
	print(z)