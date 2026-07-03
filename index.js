require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

app.use(express.static(path.join(__dirname, 'public')));

// API: stats
app.get('/api/stats', async (req, res) => {
  const { count: studentsCount } = await supabase
    .from('students').select('*', { count: 'exact', head: true });
  const { count: staffCount } = await supabase
    .from('staff').select('*', { count: 'exact', head: true });
  res.json({ students: studentsCount, staff: staffCount });
});

// API: all students
app.get('/api/students', async (req, res) => {
  const { data, error } = await supabase
    .from('students').select('id, nombre, apellido, campus, activo').order('apellido');
  if (error) return res.json({ error: error.message });
  res.json(data);
});

// API: single student
app.get('/api/students/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('students').select('*').eq('id', req.params.id).single();
  if (error) return res.json({ error: error.message });
  res.json(data);
});

// API: all staff
app.get('/api/staff', async (req, res) => {
  const { data, error } = await supabase
    .from('staff').select('id, nombre, apellido, campus, categoria').order('apellido');
  if (error) return res.json({ error: error.message });
  res.json(data);
});

// API: single staff
app.get('/api/staff/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('staff').select('*').eq('id', req.params.id).single();
  if (error) return res.json({ error: error.message });
  res.json(data);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));