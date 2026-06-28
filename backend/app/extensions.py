from flask_jwt_extended import JWTManager

# MongoEngine has no Flask app-factory object to instantiate the way
# Flask-SQLAlchemy does -- connections are registered globally via
# mongoengine.connect() (see app/__init__.py's create_app()). JWTManager
# still follows the normal Flask extension pattern.
jwt = JWTManager()
