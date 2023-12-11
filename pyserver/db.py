import psycopg2
import os
import sys

# Initialize database connection
def init_db_connection():
    if len(sys.argv) > 1 and sys.argv[1] == 'dev':
        db_host = 'localhost'
    else:
        db_host = 'quiri.shop'

    db_password = os.environ.get('DATABASE_PASSWORD', 'tGTCX!(<lZOnCWm')
    
    return psycopg2.connect(
        user='postgres',
        host=db_host,
        database='quiri',
        password=db_password,
        port=5432
    )

# Ensure the database connection is alive
def ensure_db_connection(db_conn):
    try:
        db_conn.cursor()
    except (psycopg2.InterfaceError, psycopg2.OperationalError):
        db_conn = init_db_connection()
        print("Reconnecting to ", db_conn.get_dsn_parameters()['host'])
    return db_conn

# Global variable for the database connection
db_conn = init_db_connection()

