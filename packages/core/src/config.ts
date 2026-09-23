// Public, client-safe values. The publishable key only allows what the database's
// row-level security policies permit — it is not a secret.
export const SUPABASE_URL = 'https://bepdjvbddwgcofxrjnwu.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wBA_TocjjQ_QBwxJ1ja_wQ_hiCcVmMI';

// Must match the email in the admin RLS policies in supabase/schema.sql.
export const ADMIN_EMAIL = 'abhirup.bhadra02@gmail.com';

export const MIN_PASSWORD_LENGTH = 8;
