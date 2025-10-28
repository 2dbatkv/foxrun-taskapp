#!/bin/bash

echo "=========================================="
echo "PostgreSQL Database Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up database for Task Planner App...${NC}"
echo ""

# Run the SQL setup script
sudo -u postgres psql -f setup_database.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "Database Setup Successful!"
    echo "==========================================${NC}"
    echo ""
    echo "Database Details:"
    echo "  Database Name: task_planner_db"
    echo "  Username:      taskuser"
    echo "  Password:      taskpass123"
    echo "  Host:          localhost"
    echo "  Port:          5432"
    echo ""
    echo "Connection String:"
    echo "  postgresql://taskuser:taskpass123@localhost/task_planner_db"
    echo ""
    echo -e "${YELLOW}Testing connection...${NC}"

    # Test the connection
    PGPASSWORD=taskpass123 psql -h localhost -U taskuser -d task_planner_db -c "SELECT 'Connection successful!' AS status;"

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Database is ready to use!${NC}"
    else
        echo ""
        echo "Note: If connection failed, you may need to configure pg_hba.conf"
        echo "See the documentation for details."
    fi
else
    echo ""
    echo "Database setup encountered an error."
    echo "Please check the error messages above."
fi
