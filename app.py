#   Importing Flask
from flask import Flask, render_template

#   Created an Instance of the Class
#   First argument (app) is the name of the app
app = Flask(__name__)

@app.route("/")
def server_test():
    return render_template('index.html')

