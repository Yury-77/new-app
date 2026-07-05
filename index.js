require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Supabase клієнт для сервера (secret key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// --- AUTH ROUTES ---

// Логін
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { createClient: createAnonClient } = require('@supabase/supabase-js');
  const anonSupabase = createAnonClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  const { data, error } = await anonSupabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Невірний email або пароль' });
  res.json({ token: data.session.access_token, user: data.user.email });
});

// Створити нового користувача (тільки для адміна)
app.post('/api/auth/create-user', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, user: data.user.email });
});
// Отримати список користувачів
app.get('/api/auth/users', async (req, res) => {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data.users.map(u => ({ id: u.id, email: u.email, created_at: u.created_at })));
});

// Видалити користувача
app.delete('/api/auth/users/:id', async (req, res) => {
  const { error } = await supabase.auth.admin.deleteUser(req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});
// Змінити пароль користувача
app.patch('/api/auth/users/:id/password', async (req, res) => {
  const { password } = req.body;
  const { data, error } = await supabase.auth.admin.updateUserById(req.params.id, { password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// Middleware — перевірка токена
async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Не авторизовано' });
  const token = auth.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'Невірний токен' });
  next();
}

// --- API ROUTES (захищені) ---

app.get('/api/stats', requireAuth, async (req, res) => {
  const { count: studentsCount } = await supabase
    .from('students').select('*', { count: 'exact', head: true });
  const { count: staffCount } = await supabase
    .from('staff').select('*', { count: 'exact', head: true });
  res.json({ students: studentsCount, staff: staffCount });
});

app.get('/api/students', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('students').select('id, nombre, apellido, campus, activo, sexo').order('apellido');
  if (error) return res.json({ error: error.message });
  res.json(data);
});

app.get('/api/students/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('students').select('*').eq('id', req.params.id).single();
  if (error) return res.json({ error: error.message });
  res.json(data);
});

// Створити нового студента
app.post('/api/students', requireAuth, async (req, res) => {
  const { nombre, apellido, fecha_nacimiento, sexo, campus, fecha_inscripcion } = req.body;
  const { data, error } = await supabase
    .from('students')
    .insert([{ nombre, apellido, fecha_nacimiento, sexo, campus, fecha_inscripcion, activo: 'Activo' }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

app.get('/api/staff', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('staff').select('id, nombre, apellido, campus, categoria').order('apellido');
  if (error) return res.json({ error: error.message });
  res.json(data);
});

app.get('/api/staff/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('staff').select('*').eq('id', req.params.id).single();
  if (error) return res.json({ error: error.message });
  res.json(data);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));