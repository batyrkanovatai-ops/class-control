import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'db.json');

const initialStudents = [
  'Абдимиталипова А.', 'Абдырашитова А.', 'Абдырашитова Э.', 'Абдыкадыров Б.',
  'Абдыкадыров И.', 'Абылкасымова К.', 'Азимжанова Ш.', 'Батырканов А.',
  'Дамиров А.', 'Жылдызбек к Б.', 'Иматкулова А.', 'Исабекова А.',
  'Исмаилова А.', 'Камбаралиев Ө.', 'Каныбеков А.', 'Качкынов М.',
  'Кочорбеков Д.', 'Кубанычбекова А.', 'Кубатбекова А.', 'Курбаналиева Н.',
  'Малымуратова А.', 'Масалбеков Э.', 'Муратов А.', 'Мырзаева П.',
  'Омургазиева А.', 'Орозалиев А.', 'Осконов Б.', 'Султанбекова Ж.',
  'Сыдыгалиев С.', 'Таштанбеков Р.', 'Тимурова А.', 'Токтошов Б.',
  'Шурубекова Х.', 'Эргешова Р.', 'Эркинбеков А.', 'Эркинбекова А.'
].map((name, index) => ({
  id: index + 1,
  name,
  rating: 100,
  attendance: Array(7).fill('PRESENT'),
  arrivalTime: null,
  violations: [],
  explanations: []
}));

function getDB() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ students: initialStudents }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveDB(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/students', (req, res) => {
  const db = getDB();
  res.json(db.students);
});

app.post('/api/attendance', (req, res) => {
  const { studentId, lessonNumber, status, arrivalTime } = req.body;
  const db = getDB();
  const student = db.students.find(s => s.id === studentId);

  if (student) {
    if (status === 'FROM_LESSON_2') {
      student.attendance[0] = 'ABSENT';
      student.attendance[1] = 'PRESENT';
    } else if (status === 'FROM_LESSON_3') {
      student.attendance[0] = 'ABSENT';
      student.attendance[1] = 'ABSENT';
      student.attendance[2] = 'PRESENT';
    } else {
      student.attendance[lessonNumber - 1] = status;
    }

    if (arrivalTime) {
      student.arrivalTime = arrivalTime;
    }
    saveDB(db);
  }
  res.json({ success: true, students: db.students });
});

app.post('/api/rating', (req, res) => {
  const { studentId, delta } = req.body;
  const db = getDB();
  const student = db.students.find(s => s.id === studentId);

  if (student) {
    student.rating = Math.min(100, Math.max(0, student.rating + delta));
    saveDB(db);
  }
  res.json({ success: true, students: db.students });
});

app.post('/api/explanation', (req, res) => {
  const { studentId, text } = req.body;
  const db = getDB();
  const student = db.students.find(s => s.id === studentId);

  if (student) {
    student.explanations.push({ text, date: new Date().toISOString() });
    saveDB(db);
  }
  res.json({ success: true });
});

const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Class Control running on port ${PORT}`);
});
