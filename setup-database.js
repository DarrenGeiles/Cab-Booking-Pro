const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    const sql = fs.readFileSync('/app/lib/db-init.sql', 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement
        });
        
        if (error) {
          // Try alternative method - direct query
          const { error: error2 } = await supabase.from('_').select('*').limit(0);
          console.log(`Statement ${i + 1}: Needs manual execution in Supabase SQL editor`);
        } else {
          console.log(`Statement ${i + 1}: Success`);
        }
      } catch (err) {
        console.log(`Statement ${i + 1}: ${err.message}`);
      }
    }
    
    console.log('\n===========================================');
    console.log('Database setup SQL is ready!');
    console.log('===========================================\n');
    console.log('Please run the SQL from /app/lib/db-init.sql manually in Supabase:');
    console.log('1. Go to https://uxxutyvtoovenbbhovhf.supabase.co');
    console.log('2. Click on "SQL Editor" in the left sidebar');
    console.log('3. Create a new query');
    console.log('4. Copy the contents of /app/lib/db-init.sql');
    console.log('5. Paste and run the query');
    console.log('\nThis will create all necessary tables for the Cab Booking Portal.');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
