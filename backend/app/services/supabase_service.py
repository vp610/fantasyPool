from supabase import create_client
from config import Config

class SupabaseService:
    def __init__(self):
        self.supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

    def fetch_table(self, table_name):
        response = self.supabase.table(table_name).select("*").execute()
        return response.data

    def insert_into_table(self, table_name, data):
        response = self.supabase.table(table_name).insert(data).execute()
        return response.data

    def update_table(self, table_name, match_conditions, update_data):
        response = self.supabase.table(table_name).update(update_data).match(match_conditions).execute()
        return response.data

    def delete_from_table(self, table_name, match_conditions):
        response = self.supabase.table(table_name).delete().match(match_conditions).execute()
        return response.data
