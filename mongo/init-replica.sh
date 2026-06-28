#!/bin/bash
# Initializes the 3-node replica set the first time the containers come up.
# Idempotent: the embedded JS checks rs.status() first and only calls
# rs.initiate() if the replica set doesn't exist yet, so re-running this
# container against an already-initialized set is a safe no-op.
set -e

echo "Waiting for mongo1 to accept connections..."
until mongosh --host mongo1:27017 --eval "db.adminCommand('ping')" >/dev/null 2>&1; do
  sleep 2
done

echo "Initiating replica set rs0..."
mongosh --host mongo1:27017 <<'JS'
try {
  rs.status();
  print("Replica set already initialized.");
} catch (e) {
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "mongo1:27017", priority: 2 },
      { _id: 1, host: "mongo2:27017", priority: 1 },
      { _id: 2, host: "mongo3:27017", priority: 1 }
    ]
  });
  print("Replica set initiated.");
}
JS

echo "Waiting for a PRIMARY to be elected..."
until mongosh --host mongo1:27017 --quiet --eval "db.hello().isWritablePrimary || db.hello().secondary" | grep -q true; do
  sleep 2
done

echo "Replica set rs0 is up."
