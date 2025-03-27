#   Importing Flask
from flask import Flask

#   Created an Instance of the Class
#   First argument (app) is the name of the app
app = Flask(__name__)

@app.route("/")
def server_test():
    return "<p>Server 101 // Clear<p>"

