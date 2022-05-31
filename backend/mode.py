# SPDX-FileCopyrightText: 2021 ladyada for Adafruit Industries
# SPDX-License-Identifier: MIT

from os import stat
import time

from jinja2 import Undefined
import board
import neopixel
import hextorgb
import json
import random
import datetime

from adafruit_led_animation.animation.comet import Comet
from adafruit_led_animation.animation.rainbowcomet import RainbowComet
from adafruit_led_animation.animation.rainbowchase import RainbowChase
from adafruit_led_animation.animation.rainbowsparkle import RainbowSparkle
from adafruit_led_animation.animation.chase import Chase
from adafruit_led_animation.animation.rainbow import Rainbow
from adafruit_led_animation.sequence import AnimationSequence
from adafruit_led_animation.animation.blink import Blink
from adafruit_led_animation.animation.solid import Solid
from adafruit_led_animation.animation.pulse import Pulse
from adafruit_led_animation.animation.sparkle import Sparkle
from adafruit_led_animation.animation.sparklepulse import SparklePulse
from adafruit_led_animation.animation.colorcycle import ColorCycle
from adafruit_led_animation import helper
from adafruit_led_animation.group import AnimationGroup
from adafruit_led_animation.color import PURPLE, JADE, AMBER
import RPi.GPIO as GPIO
# On CircuitPlayground Express, and boards with built in status NeoPixel -> board.NEOPIXEL
# Otherwise choose an open pin connected to the Data In of the NeoPixel strip, i.e. board.D1
pixel_pin = board.D18

# Define the pin for the microphone
# Actually the microphone is not used in this case, but it is useful to know
MicPin = 3
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(MicPin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

# Define the number of NeoPixels
path='./config/config.json'
with open(path, 'r+',encoding='utf8') as f:
    data = json.load(f)
    print(data['number']*30 )
    num_pixels = data['number']*30
numTriangle = int(num_pixels/30)
ORDER = neopixel.GRB

# Declare the states of the animation
status = True
effectOnRun = False

# Declare the brightness of the pixels
brightness =1

# Declare the color variable
allColor =(255,255,255)

# Declare the stop time variable
stopTime= Undefined

pixels = neopixel.NeoPixel(
    pixel_pin, num_pixels, brightness=brightness, auto_write=False, pixel_order=ORDER
)



"""
Utillity functions
"""

def setBrightness(data): 
    """
    Return the brightness of the pixels
    param: data: the brightness of the pixels

    """
    global brightness
    brightness = int(data)/100
    global pixels
    pixels = neopixel.NeoPixel(
    pixel_pin, num_pixels, brightness=brightness, auto_write=False, pixel_order=ORDER
    )
    return brightness


def updatePixels(count):
    """
    Update the pixels count
    param: count: the number of pixels
    """
    global brightness
    global pixels
    global num_pixels
    num_pixels=count
    global numTriangle
    numTriangle =int(count/30)
    print(numTriangle)
    pixels.fill((0,0,0))
    pixels.show()
    pixels = neopixel.NeoPixel(
    pixel_pin, count, brightness=brightness, auto_write=False, pixel_order=ORDER
    )
    for i in range(numTriangle):
        pixels.fill((255,255,255))
        pixels.show()
        time.sleep(0.2)
        pixels.fill((0,0,0))
        pixels.show()
        time.sleep(0.2)
    return True

def timeChecker() :
    """
    Update the status of the animation when the time is over
    """
    currentTime=(datetime.datetime.now())
    global stopTime
    global status
    if stopTime != Undefined:
        if(currentTime<stopTime):
            status = True
            return True
        else :
            status = False
            return False
    elif stopTime == Undefined:
        return True

def adaptSpeed(speed, maxSpeed): 
    return maxSpeed/1*speed


""" 
Modes functions
"""
def color(color):
    """
    Change the color of the pixels
    param: color: the color of the pixels
    """
    global status
    status = False
    global allColor 
    allColor= hextorgb.hex_to_rgb(color)
    pixels.fill(hextorgb.hex_to_rgb(color))
    pixels.show()
    return allColor

def powerOff(state):
    """
    Power off/on the pixels
    param: state: the color of the pixels
    """
    pixels.fill(hextorgb.hex_to_rgb(state))
    pixels.show()
    return state 

def wheel(pos):
    """ 
    Generate rainbow colors across 0-255 positions.
    The colours are a transition r - g - b - back to r.
    param: pos: the position of the color
    """
    if pos < 0 or pos > 255:
        r = g = b = 0
    elif pos < 85:
        r = int(pos * 3)
        g = int(255 - pos * 3)
        b = 0
    elif pos < 170:
        pos -= 85
        r = int(255 - pos * 3)
        g = 0
        b = int(pos * 3)
    else:
        pos -= 170
        r = 0
        g = int(pos * 3)
        b = int(255 - pos * 3)
    return (r, g, b) 




def rainbowWheel(speed,size,spacing,period,map_1,rainbow,onAll):
    """
    Draw rainbow that fades across all triangles at the same time.

    Keyword arguments:
    speed -- how fast to fade the rainbow, in seconds
    onAll --  turn on all triangles on same time or just turn one
    """
    global status
    if (onAll):
        speed = (adaptSpeed(speed, 0.001))
        
        while status:   
            timeChecker()     
            for j in range(255):
                if status :
                    for i in range(numTriangle):
                        for k in range (30):
                            pixel_index = (((k)+i) *255 //30) + j
                            pixels[i*30+k] = wheel(pixel_index & 255)
                    
                    pixels.show()
                    time.sleep(0.001-speed)
    else :
        speed = (0.007*numTriangle) -numTriangle*(adaptSpeed(speed, 0.007))
        while status:
            timeChecker() 
            for j in range(255):
                if(status):
                    for i in range(num_pixels):
                        pixel_index = (i * 256 // num_pixels) + j
                        pixels[i] = wheel(pixel_index & 255)
                    
                    pixels.show()
                    time.sleep(speed)
    if(status == False) :
        powerOff("#000000")
        return False

def colorWipe( speed,size,spacing,period,map_1,rainbow,onAll) :
    """
    Draw a line in the specified color across the whole display.
    param : speed: the speed of the animation
    param : spacing: the spacing between leds on
    """
    global allColor
    global status
    speed = adaptSpeed(speed, 0.1)
    if(num_pixels ==spacing):
        spacing -=1
    while status:
        timeChecker()
        for i in range(int(num_pixels)):
            if status ==False :
                break
            else:
                pixels[i] = allColor
                pixels[i-spacing] = (0,0,0)
                pixels.show()
                time.sleep(0.1- speed)
    if(status == False) :
        powerOff("#000000")
              
  
def cometAllSameTime( speed,size,spacing,period,map_1,rainbow,onAll) :
    """
    Actually do nothing
    it is for use a microphone
    """
    global allColor
    
    while status:
        if(GPIO.input(MicPin) ==1):
            print('hight')
            pixels.fill((255,0,255))
            pixels.show()
        else : 
            print('low')
            pixels.fill((0,0,0))
            pixels.show()
   
        

def randomEffects(speed,size,spacing,period,map_1,rainbow,onAll) :
    """
    Display random effects
    """
    global allColor
    global status
    global numTriangle
    the_animations = []
    if(period ==30):
        period -= 1
    
    for i in range(0,numTriangle) :
        print(size)
        choice = random.choice(["chase", "comet","rainbowChase","pulse"])
        print(choice)
        maps=helper.PixelMap(pixels, [(x,) for x in range(i*30,(i+1)*30)], individual_pixels=True)
        if (choice == "chase"):
            print("chase")
            speedChase = adaptSpeed(speed, 0.2)
            chase= Chase(maps,color=allColor, speed=0.22-speedChase, size=size, spacing=spacing)
            the_animations.append(chase)
            
        elif (choice == "comet"):
            print("comet")
            speedComet = (adaptSpeed(speed, 0.1)/numTriangle)*3
            print(size)
            sizeCommet = size
            if(size ==1):
                sizeCommet =size+2
            comet = Comet(maps, speed=(0.11-speedComet), color=(allColor), tail_length=sizeCommet)
            the_animations.append(comet)

        elif (choice =="rainbowChase"):
            speedRainbowChase = adaptSpeed(speed, 0.2)
            print("rainbow")
            print(period)
            rainbowChase= RainbowChase(maps, speed=0.22-speedRainbowChase, size=size, spacing=spacing, step=round(period))
            the_animations.append(rainbowChase)
        elif (choice =="pulse"):
            print("pulse")
            print(speed)
            speedPulse=adaptSpeed(speed, 2)
            pulse= Pulse(maps, speed=0.03, color=allColor,period=2.1-speedPulse)
            the_animations.append(pulse)


    print(the_animations)
    group = AnimationGroup(*the_animations)
    while status:
        timeChecker()
        for i in range(0,numTriangle):
            try:
                the_animations[i].color = allColor
            except :
                pass
        group.animate()
    if(status == False) :
        powerOff("#000000")
    

def coteWipe( speed,size,spacing,period,map_1,rainbow,onAll) :
    """
    Draw a line that turns into a triangle
    """
    global allColor
    global numTriangle
    global status
    status = False
    speed = adaptSpeed(speed, 0.1)
    time.sleep(0.5)
    status = True
    while status:
        timeChecker()
        print(status)
        for j in range(0,255,40):
            if status :
                for i in range(0,int(30),10):
                    if status :
                    
                        for k in range(numTriangle+1) :
                            if status :
                                print(status)
                                if rainbow :
                                    color = wheel(j)
                                else :
                                    color = allColor
                                pixels[(i+(k*30)):(i+(k*30))+10] = [color] * 10
                                pixels[(i+(k*30))-10:(i+(k*30))+1] = [(0,0,0)] * 11
                                pixels.show()
                            
                            else :
                                break
                    else :
                        break
                    time.sleep(0.2-speed)
            else :
                break
    if(status == False) :
        powerOff("#000000")


def chase( speed,size,spacing,period,map_1,rainbow,onAll) :
    global allColor
    global status
    status =False
    speed = adaptSpeed(speed, 0.2)
    print(speed)
    if (rainbow == True):
        status = True
        rainbowChase= RainbowChase(map_1, speed=0.2-speed, size=size, spacing=spacing, step=62-round(period)*2)
        group1 = AnimationSequence(rainbowChase)
        while status:
            timeChecker()
            group1.animate()
    else :
        status = True
        chase = Chase(map_1, speed=0.2-speed ,size=size, spacing=spacing, color=allColor)
        group1 = AnimationSequence(chase)
        while status:
            timeChecker()
            group1.color = allColor
            group1.animate()
    if(status == False) :
        powerOff("#000000")
    
    

def comet( speed,size,spacing,period,map_1,rainbow,onAll) :
    global allColor
    global numTriangle
    print(size)
    
    if(size ==1):
        size +=1
    
    if (onAll== False):
        size = size * numTriangle
        speed = adaptSpeed(speed, 0.1)
        if(rainbow==False):
            
            comet = Comet(map_1, speed=(0.1-speed), color=(allColor), tail_length=round(size), bounce=False,ring=True)
            group1 = AnimationSequence(comet)
            while status:
                timeChecker()
                group1.color = allColor
                group1.animate()
        else : 
            rainbowCommet= RainbowComet(map_1, speed=(0.1-speed), tail_length=size, bounce=False, ring=True)
            group1 = AnimationSequence(rainbowCommet)
            while status:
                timeChecker()
                group1.animate()
    
    else :
        the_animations = []
        speed = (adaptSpeed(speed, 0.098)/numTriangle)*3
        for i in range(0,numTriangle) :
            maps=helper.PixelMap(pixels, [(x,) for x in range(i*30,(i+1)*30)], individual_pixels=True)  
            if(rainbow==False):
                comet = Comet(maps, speed=(0.11-speed), color=(allColor), tail_length=round(size), bounce=False,ring=True)
                the_animations.append(comet)
                
            else : 
                rainbowCommet= RainbowComet(maps, speed=(0.11-speed), tail_length=size, bounce=True)
                the_animations.append(rainbowCommet)

        group = AnimationGroup(*the_animations)
        while status:
            timeChecker()
            group.animate()
    if(status == False) :
        powerOff("#000000")


def rainbow(speed,size,spacing,period,map_1,rainbow,onAll) :
    """
    The classic rainbow color wheel.
    :param pixel_object: The initialised LED object.
    :param float speed: Animation refresh rate in seconds, e.g. ``0.1``.
    :param float period: Period to cycle the rainbow over in seconds.  Default 5.
    :param float step: Color wheel step.  Default 1.
    :param str name: Name of animation (optional, useful for sequences and debugging).
    :param bool precompute_rainbow: Whether to precompute the rainbow.  Uses more memory.
                                    (default True).
    """
    global allColor
    print(speed)
    global numTriangle
    period =int(period+1/2)
    if (onAll== True):
        speed = adaptSpeed(speed, 0.3)
        rainbow= Rainbow(map_1, speed=0.3-speed, period=period)
        group1 = AnimationSequence(rainbow)
        
        while status:
            timeChecker()
            group1.animate()
    else :
        speed = (adaptSpeed(speed, 0.3)/numTriangle)*4.5
        
        the_animations = []
        for i in range(0,numTriangle) :
            maps=helper.PixelMap(pixels, [(x,) for x in range(i*30,(i+1)*30)], individual_pixels=True)  
            rainbow= Rainbow(maps, speed=0.3-speed, period=period)
            the_animations.append(rainbow)

        group = AnimationGroup(*the_animations)
        while status:
            timeChecker()
            group.animate()


def blink( speed,size,spacing,period,map_1,rainbow,onAll) :
    global allColor
    if(speed ==1):
        speed -=0.02
    blink= Blink(map_1, speed=(1-speed), color=allColor)
    group1 = AnimationSequence(blink)
    while status:
        timeChecker()
        group1.color = allColor
        group1.animate()

def solid( speed,size,spacing,period,map_1,rainbow,onAll) :
    global allColor
    solid= Solid(map_1, color=allColor)
    group1 = AnimationSequence(solid)
    while status:
        timeChecker()
        group1.color = allColor
        group1.animate()

def colorCycle( speed,size,spacing,period,map_1,rainbow,onAll) :
    global allColor
    global status
    speed = adaptSpeed(speed, 1)
    if(onAll) :
        colorcycle= ColorCycle(map_1, speed=1-speed)
        group1 = AnimationSequence(colorcycle)
        while status:
            timeChecker()
            group1.animate()
        
        if(status == False) :
            powerOff("#000000")
    
    else :
        global numTriangle
        the_animations = []
        colorList = [
        (0,0,255),(0,255,255),(255,0,255),(255,0,0),(255,255,255)
        ]
        
        for i in range(0,numTriangle) :
            random.shuffle(colorList)
            print((colorList))
            maps=helper.PixelMap(pixels, [(x,) for x in range(i*30,(i+1)*30)], individual_pixels=True)         
        
            colorcycle= ColorCycle(maps, speed=1-speed,colors=colorList)
            the_animations.append(colorcycle)

        group = AnimationGroup(*the_animations)
        while status:
            timeChecker()
            group.animate()

def pulse( speed,size,spacing,period,map_1,rainbow,onAll) :
    global allColor
    speed=adaptSpeed(speed, 1)
    print(speed)
    pulse= Pulse(map_1, speed=0.001, color=allColor,period=1.01-speed)
    group1 = AnimationSequence(pulse)
    while status:
        timeChecker()
        group1.color = allColor
        group1.animate()
    if(status == False) :
        powerOff("#000000")

def sparklePulse( speed,size,spacing,period,map_1,rainbow,onAll) :
    global allColor
    speed=adaptSpeed(speed, 0.2)
    sparkle= SparklePulse(map_1, speed=0.1-speed, color=allColor, period=period)
    group1 = AnimationSequence(sparkle)
    while status:
        timeChecker()
        group1.color = allColor
        group1.animate()
    if(status == False) :
        powerOff("#000000")
    

def sparkle( speed,size,spacing,period,map_1,rainbow,onAll) :
    global allColor
    global numTriangle
    
    print(rainbow)
    if (onAll == False):
        speed=adaptSpeed(speed, 0.2)
        if (rainbow == False):
            sparkle= Sparkle(map_1, speed=0.1-speed, color=allColor,num_sparkles=5)
            group1 = AnimationSequence(sparkle)
            while status:
                timeChecker()
                group1.color = allColor
                group1.animate()
            if(status == False) :
                powerOff("#000000")
        else :
            sparkle= RainbowSparkle(map_1, speed=0.1-speed, period = period, step =1)
            group1 = AnimationSequence(sparkle)
            while status:
                timeChecker()
                group1.color = allColor
                group1.animate()
            if(status == False) :
                powerOff("#000000")
    else :
        speed= (adaptSpeed(speed, 0.3))
        print(speed)
        if speed <0.12 :
            speed = 0.12
        the_animations = []
        for i in range(0,numTriangle) :
            maps=helper.PixelMap(pixels, [(x,) for x in range(i*30,(i+1)*30)], individual_pixels=True)         
            
            sparkle= RainbowSparkle(maps, speed=0.12, period = period, step =1)
            the_animations.append(sparkle)

        group = AnimationGroup(*the_animations)
        while status:
            timeChecker()
            for i in range(0,numTriangle):
                try:
                    the_animations[i].color = allColor
                except :
                    pass
            group.animate()

        if(status == False) :
            powerOff("#000000")

