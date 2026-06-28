#!/bin/bash
set -e

# MongoEngine connects lazily and collections/indexes are created on first
# write, so there is no schema migration step to run here. This still
# gives a clear, fail-fast log line on container start: if the replica set
# is unreachable, the container exits here instead of inside gunicorn.
python -c "from app import create_app; create_app(); print('MongoDB connection verified, indexes will sync on first write.')"

exec "$@"
