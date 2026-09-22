import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fkjifpexqiqjegamvqtx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramlmcGV4cWlxamVnYW12cXR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDA2ODM4MSwiZXhwIjoyMTA1NjQ0MzgxfQ.UaoOj40GH9Ea5tnoAtfvHMDBICgL5XSaMOMyZ6JAU_4';

const sb = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const { data: user, error: fetchErr } = await sb
    .from('profiles')
    .select('*')
    .ilike('university_email', '%24-59069-3%')
    .single();

  if (fetchErr || !user) {
    console.error('Error fetching user:', fetchErr);
    return;
  }

  console.log('Current profile:', user);

  const { data: updated, error: updateErr } = await sb
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', user.id)
    .select()
    .single();

  if (updateErr) {
    console.error('Error updating role:', updateErr);
    return;
  }

  console.log('Successfully promoted user to admin:', updated);
}

main();
