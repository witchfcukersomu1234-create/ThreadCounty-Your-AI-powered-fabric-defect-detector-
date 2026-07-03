from supabase import create_client, Client
from .config import settings

def get_supabase() -> Client:
    # Use the service role key for backend operations so we can bypass RLS when needed (like creating users)
    # If not provided, it falls back to ANON_KEY in settings.
    supabase_url: str = settings.supabase_url
    supabase_key: str = settings.supabase_service_role_key
    return create_client(supabase_url, supabase_key)

# A client configured for normal user-level operations (if needed)
def get_supabase_anon() -> Client:
    supabase_url: str = settings.supabase_url
    supabase_key: str = settings.VITE_SUPABASE_ANON_KEY
    return create_client(supabase_url, supabase_key)
