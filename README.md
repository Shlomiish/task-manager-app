# Task Manager Application

## About

A full-stack task management application with real-time database change monitoring using TiDB Change Data Capture (CDC).

## Tech Stack

**Frontend:** React, Nginx  
**Backend:** Node.js, Express, JWT Authentication  
**Database:** TiDB (distributed MySQL-compatible database)  
**Message Broker:** Apache Kafka  
**CDC:** TiDB CDC for capturing database changes  
**Logging:** log4js  
**Containerization:** Docker, Docker Compose

## Architecture Flow

1. User authenticates via React frontend → Backend generates JWT token
2. User creates/updates/deletes tasks → Backend writes to TiDB database
3. TiDB CDC captures database changes → Sends to Kafka topic
4. CDC Consumer reads from Kafka → Logs structured change events
5. All logs viewable via Dozzle dashboard

---

## Quick Start

Start all services:

```bash
docker-compose up --build -d
```

## View CDC Consumer Logs

**Option 1: Command Line**

```bash
docker-compose logs -f cdc-consumer
```

**Option 2: Web UI**
Open Dozzle at http://localhost:9999

## Access Application

- **Frontend:** http://localhost:3000
- **Logs Dashboard:** http://localhost:9999

## Default Credentials

- **Email:** admin@example.com
- **Password:** admin123

## Stop Services

```bash
docker-compose down
```
