-- Task Planner Database Setup Script
-- This script creates the database, user, and sets up permissions

-- Create the database
CREATE DATABASE task_planner_db;

-- Create the user with a password
CREATE USER taskuser WITH PASSWORD 'taskpass123';

-- Grant connection privileges
GRANT ALL PRIVILEGES ON DATABASE task_planner_db TO taskuser;

-- Connect to the new database
\c task_planner_db

-- Grant schema privileges (required for PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO taskuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO taskuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO taskuser;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO taskuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO taskuser;

-- Display success message
\echo 'Database setup completed successfully!'
\echo 'Database: task_planner_db'
\echo 'User: taskuser'
\echo 'Password: taskpass123'
