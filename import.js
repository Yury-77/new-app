require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

function parseDate(d) {
  if (!d) return null;
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
}

function parseCSV(text) {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,''));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g,''));
    const obj = {};
    headers.forEach((h, i) => obj[h] = vals[i] || null);
    return obj;
  });
}

async function importData() {
  // Students
  //const studentsRaw = fs.readFileSync('Alumnos-Yurii.csv', 'utf8');
  //const studentsData = parseCSV(studentsRaw).map(r => ({
    //personal_id: r['Personal ID'],
    //activo: r['Activo/Inactivo'],
    //campus: r['Campus'],
    //apellido: r['Apellido'],
    //nombre: r['Nombre'],
    //fecha_inscripcion: parseDate(r['Fecha de inscripción']),
    //sexo: r['Sexo'],
    //fecha_nacimiento: parseDate(r['Fecha de nacimiento'])
 // }));

  //for (let i = 0; i < studentsData.length; i += 50) {
    //const batch = studentsData.slice(i, i + 50);
    //const { error } = await supabase.from('students').insert(batch);
    //if (error) console.error('Students error:', error.message);
    //else console.log(`Students: inserted rows ${i+1}-${i+batch.length}`);
  //}

  // Staff
  const staffRaw = fs.readFileSync('Staff-Yurii View.csv', 'utf8');
  const staffData = parseCSV(staffRaw).map(r => ({
    personal_id: r['Personal ID'],
    campus: r['Campus'],
    categoria: r['Categoría'],
    apellido: r['Apellido'],
    nombre: r['Nombre'],
    area_ensenanza: r['Área de enseñanza'],
    estado_laboral: r['Estado laboral'],
    fecha_inicio: parseDate(r['Fecha de inicio'])
  }));

  for (let i = 0; i < staffData.length; i += 50) {
    const batch = staffData.slice(i, i + 50);
    const { error } = await supabase.from('staff').insert(batch);
    if (error) console.error('Staff error:', error.message);
    else console.log(`Staff: inserted rows ${i+1}-${i+batch.length}`);
  }

  console.log('Import complete!');
}

importData();