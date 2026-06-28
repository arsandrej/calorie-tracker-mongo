# CalTrack — Calorie & Macro Tracker

A minimalist, MyFitnessPal-style calorie tracker: a daily summary of calories, protein, carbs, and fat, plus a 7-day history view. Built as a 3-tier application (front-end, back-end, database) for an advanced CI/CD course project, with a **MongoDB replica set** as the data layer to demonstrate horizontally scalable, production-style database deployment.

## Stack

| Component | Technology |
|---|---|
| Frontend | React + Vite + Tailwind + TypeScript |
| Backend | Flask + MongoEngine + Flask-JWT-Extended |
| Database | MongoDB 7, deployed as a 3-node replica set (`rs0`) |
| Containerization | Docker (multi-stage builds) |
| Orchestration | Docker Compose, Kubernetes (StatefulSet + Job) |
| CI/CD | GitHub Actions (test → build & push → deploy) |
| Tests | pytest + mongomock (backend), Vitest + React Testing Library (frontend) |

## Why a replica set?

A single MongoDB container is a single point of failure and a single read/write bottleneck — the same problem the original single Postgres container had. A **replica set** is the standard MongoDB answer:

- **One PRIMARY** node accepts all writes.
- **Two or more SECONDARY** nodes continuously replicate the primary's oplog.
- If the primary goes down, the remaining nodes **automatically elect a new primary** — no manual intervention, no application restart.
- Secondaries can serve reads, spreading read load across nodes (horizontal read scaling) — the first step toward the sharding you'd add for horizontal *write* scaling at larger scale.
- The driver (PyMongo, via MongoEngine) is replica-set-aware: the app is configured with a **seed list** of all members plus `replicaSet=rs0`, and it discovers and follows the current primary on its own. The application code never hardcodes "the database" as one host.

This project runs that exact topology — 3 `mongod` nodes forming `rs0` — both locally (Docker Compose) and in Kubernetes (a 3-replica `StatefulSet`), so the demo matches what you'd actually run in production, just at a smaller scale.

## Features

- Register / log in (JWT auth)
- Log food with calories, protein, carbs, fat
- **Today** view: daily totals against a calorie goal, with macro progress bars
- **History** view: last 7 days of totals, one row per day (computed with a MongoDB aggregation pipeline)
- Edit / delete any entry
- Per-user data isolation (you only ever see your own entries)

## Project layout

```
calorie-tracker/
├── .github/workflows/ci-cd.yml   # CI/CD pipeline
├── backend/                      # Flask app + tests
│   ├── app/
│   │   ├── __init__.py           # app factory, mongoengine.connect()
│   │   ├── extensions.py         # jwt
│   │   ├── models.py             # User, Entry (MongoEngine Documents)
│   │   └── routes/
│   │       ├── auth.py           # /api/register, /api/login
│   │       └── entries.py        # /api/entries, /api/history
│   ├── tests/                    # pytest + mongomock (no real DB needed)
│   ├── main.py                   # WSGI entrypoint
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                     # React app + tests
│   ├── src/
│   │   ├── components/{Auth,Dashboard,History,common}/
│   │   ├── context/AuthContext.tsx
│   │   ├── api/client.ts
│   │   └── tests/
│   ├── Dockerfile
│   └── nginx.conf
├── mongo/
│   └── init-replica.sh           # rs.initiate() for Docker Compose
├── k8s/                          # Kubernetes manifests
│   ├── mongo-statefulset.yaml    # 3-node replica set + headless Service + init Job
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── ...
├── docker-compose.yml
└── .env.example
```

## API

| Method | Path | Description |
|---|---|---|
| POST | `/api/register` | Create an account |
| POST | `/api/login` | Get a JWT access token |
| GET | `/api/entries?date=YYYY-MM-DD` | Entries + totals for a day (defaults to today) |
| POST | `/api/entries` | Log a new entry |
| PUT | `/api/entries/<id>` | Update an entry (`<id>` is a Mongo ObjectId string) |
| DELETE | `/api/entries/<id>` | Delete an entry |
| GET | `/api/history?days=7` | Daily aggregated totals for the last N days |
| GET | `/health` | Liveness check (process is up) |
| GET | `/health/db` | Readiness check (replica set is reachable) |

## Running locally with Docker Compose

```bash
cp .env.example .env   # set a real JWT_SECRET_KEY
docker-compose up --build
```

This starts `mongo1`, `mongo2`, `mongo3`, a one-shot `mongo-init` container that runs `rs.initiate()` against them, then the backend and frontend. The first boot takes a little longer than a single-Mongo setup because Compose waits for all three nodes to report healthy and for a primary to be elected before the backend starts.

- Frontend: http://localhost:3000
- Backend health: http://localhost:8000/health
- Backend DB readiness: http://localhost:8000/health/db
- Inspect the replica set: `docker exec -it calorie-mongo1 mongosh --eval "rs.status()"`

## Running locally without Docker

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # defaults to a local single-node mongod if MONGODB_URI is unset
python main.py                 # http://localhost:8000
```

A single local `mongod` (no replica set) works fine for this mode — `MONGODB_URI` defaults to `mongodb://localhost:27017/calorie_tracker` if unset.

### Frontend

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

## Tests

### Backend (pytest + mongomock)

Each test runs against an isolated **in-memory mongomock client**, so tests never touch a real MongoDB deployment and are fully isolated from one another.

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

Covers: registration (incl. duplicate-email/validation failures), login, full entries CRUD with macros, per-user data isolation, and daily history aggregation via the MongoDB aggregation pipeline.

### Frontend (Vitest + React Testing Library)

```bash
cd frontend
npm run test
```

Covers `SummaryCard`, `EntryForm`, `EntryList`, `EntryItem`, and `History`.

Both suites run automatically in the GitHub Actions `test` job before any image is built or deployed.

## Kubernetes deployment

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml

# MongoDB replica set: StatefulSet + headless Service, then wait for all
# 3 pods, then run the one-shot Job that initializes rs0.
kubectl apply -f k8s/mongo-statefulset.yaml
kubectl rollout status statefulset/mongo -n calorie-tracker
kubectl wait --for=condition=complete job/mongo-replica-init -n calorie-tracker --timeout=120s

kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-nginx-config.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml

kubectl get all -n calorie-tracker
```

Why a `StatefulSet` instead of a `Deployment` for Mongo: replica set members are identified by stable hostname (`mongo-0.mongo-service`, `mongo-1.mongo-service`, `mongo-2.mongo-service`), and each member owns its own data directory rather than sharing one volume. A `StatefulSet` is what gives pods that stable identity and a dedicated `PersistentVolumeClaim` per replica, both of which survive pod rescheduling.

To see failover in action:

```bash
kubectl exec -n calorie-tracker mongo-0 -- mongosh --quiet --eval "rs.status().members.map(m => [m.name, m.stateStr])"
kubectl delete pod mongo-0 -n calorie-tracker   # simulate the primary going down
# Kubernetes recreates mongo-0; meanwhile rs0 elects a new primary from mongo-1/mongo-2
kubectl exec -n calorie-tracker mongo-1 -- mongosh --quiet --eval "rs.status().members.map(m => [m.name, m.stateStr])"
```

## CI/CD pipeline

`.github/workflows/ci-cd.yml` runs on every push to `main`/`develop` and on PRs to `main`:

1. **test** — installs deps, runs `pytest` (against mongomock, no live database needed), runs `vitest`, runs the frontend production build.
2. **build-and-push** (main only) — builds and pushes both Docker images to Docker Hub, updates image tags in `k8s/*.yaml`, commits them back.
3. **deploy** (main only, CD) — applies manifests to your cluster: namespace/secret/configmap, then the Mongo `StatefulSet` (waiting for rollout), then the replica-set-init `Job` (waiting for completion), then backend/frontend, then waits for their rollouts too.

### Required GitHub secrets

| Secret | Description |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `KUBECONFIG` | Kubeconfig contents for your cluster |

## Notes

- Collections and indexes are created lazily by MongoEngine on first write/query — there's no separate migration step, which is normal for MongoDB's schema-flexible model (unlike the `db.create_all()` / SQL migration step a relational backend needs).
- The unique index on `users.email` is declared in `app/models.py` and enforced by MongoDB itself, so duplicate registrations are rejected correctly even with multiple backend replicas writing concurrently.
- For a real production deployment you'd also want: authentication on the Mongo replica set itself (`--auth` + a keyfile, omitted here to keep the demo focused on replication), TLS between nodes, and an Ops Manager/Atlas-style backup strategy.
- Test
- Test again
