from supabase import create_client, Client

SUPABASE_URL = "https://nwvyxngtrmsfzjnfeumb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnl4bmd0cm1zZnpqbmZldW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NTg4OTMsImV4cCI6MjA0ODEzNDg5M30.55r0CkyMNatq_nzFVdZU_wLJFBm0scSl6GiieW1dcT8"

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Export the client for use in other modules
__all__ = ["supabase"]
