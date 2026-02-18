# Full Stack Open – Part 13

This repository contains the exercises for **Part 13** of the Full Stack Open course [https://fullstackopen.com/en/part13/].

---

## Running the Project

Make sure you have **Docker** and **Docker Compose** installed on your machine.

From the root directory of the project, start the containers:

docker compose up -d

This command will:
- Build the required services
- Start the PostgreSQL database
- Run containers in detached mode

To verify the containers are running:
docker ps

---

## Accessing the Database

To connect to the PostgreSQL database inside the running container, use:
docker exec -it <database-container-id> psql -U <username> <dbname>