"""
Application Entry Point & Setup.

This module initializes the Flask application and configures global middleware, 
such as Cross-Origin Resource Sharing (CORS). It acts as the application factory,
registering Blueprints (Routers) to maintain a decoupled, modular architecture.
"""

from flask import Flask
from flask_cors import CORS
from app.routers.simulation import simulation_router

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for React communication

# Register the routers (Blueprints)
app.register_blueprint(simulation_router)

if __name__ == '__main__':
    print("🚀 Server running on http://localhost:5000")
    app.run(debug=True, port=5000)