from flask import Flask
import powerOff
import changeColors
import json
import hextorgb
import time
import board
import neopixel
import wheel
from flask import Flask, request, jsonify
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager

status = True
app = Flask(__name__)

num_pixels = 30
pixel_pin = board.D18
ORDER = neopixel.GRB

pixels = neopixel.NeoPixel(
    pixel_pin, num_pixels, brightness=1, auto_write=False, pixel_order=ORDER
)

app.config["JWT_SECRET_KEY"] = "helloCodaTriangle"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

@app.route('/token', methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    if email != "test" or password != "test":
        return {"msg": "Wrong email or password"}, 401

    access_token = create_access_token(identity=email)
    response = {"access_token":access_token}
    return response


@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response


@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

@app.route('/')
def hello_world():
    powerOff.shutdown()
    return 'Hello, World!'






@app.route('/profile')
@jwt_required() #new line
def my_profile():
    response_body = {
        "name": "Nagato",
        "about" :"Hello! I'm a full stack developer that loves python and javascript"
    }

    return response_body


@app.route('/changeColor', methods=["POST"])
def changeColor():
   # global status 
   # status = False
    data = request.get_json(force = True)
    wheel.color(data)
    
    return ('yes')
    
@app.route('/wheel')
def wheels():
    global status 
    status = True
    while status :
        wheel.rainbow_cycle(0.001)
    
    return ('yes')

@app.route('/colorWipe')
def colorWipe():
    global status 
    status = True
    while status :
        wheel.coteWipe(0.1)
    
    return ('yes')

@app.route('/allChaseWindow')
def allChaseWindow():
    global status 
    status = True
    while status :
        wheel.allChaseWindow(0.1,3,7)#speed size spacing 
    
    return ('yes')

@app.route('/off')
def setoff():
    global status 
    status = False
    time.sleep(0.5)
    wheel.powerOff()
    
    return ('yes')


if __name__ == '__main__':
    app.run()