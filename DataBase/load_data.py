import pandas as pd
from sqlalchemy import create_engine

# Database connection URL (Apna password dalna yahan)
# Format: postgresql://username:password@localhost:5432/database_name
engine = create_engine('postgresql://postgres:TUMHARA_PASSWORD@localhost:5432/sih26_ntro_db')

# CSV read karna (jab team file degi)
df = pd.read_csv('firms_data.csv')

# Data ko PostgreSQL table mein push karna
df.to_sql('firms_raw_data', engine, if_exists='append', index=False)
print("Data successfully loaded into database!")