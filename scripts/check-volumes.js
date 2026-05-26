const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key] = value;
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkVolumes() {
  try {
    const { data: volumes, error } = await supabase
      .from('volumes')
      .select('id, number, name, status, doors_date')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error:', error.message);
      return;
    }

    console.log('\n📊 Existing volumes:');
    if (volumes && volumes.length > 0) {
      volumes.forEach(v => {
        console.log(`   [${v.id}] Deuce #${v.number}: ${v.name} (${v.status})`);
      });
    } else {
      console.log('   No volumes found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkVolumes();
