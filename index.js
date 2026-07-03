require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('test').select('*');
  if (error) {
    console.error('Supabase error:', error);
    return res.json({ error: error.message });
  }
  res.json({ data });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});