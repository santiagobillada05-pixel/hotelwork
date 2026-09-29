import sqlite3

def add_currency_column():
    conn = sqlite3.connect('hotelwork.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE rooms ADD COLUMN currency VARCHAR(3) DEFAULT 'USD' NOT NULL;")
        print("Column 'currency' added to 'rooms' table.")
    except sqlite3.OperationalError as e:
        print(f"OperationalError: {e}")
    finally:
        conn.commit()
        conn.close()

if __name__ == "__main__":
    add_currency_column()
