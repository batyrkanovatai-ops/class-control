import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Award } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState('STAROSTA');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [explanationText, setExplanationText] = useState('');

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error(err));
  }, []);

  const updateAttendance = (studentId, status, lessonNumber = 1) => {
    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, lessonNumber, status, arrivalTime: '08:53' })
    })
      .then(res => res.json())
      .then(data => setStudents(data.students));
  };

  const updateRating = (studentId, delta) => {
    fetch('/api/rating', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, delta })
    })
      .then(res => res.json())
      .then(data => setStudents(data.students));
  };

  const sendExplanation = (studentId) => {
    if (!explanationText) return;
    fetch('/api/explanation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, text: explanationText })
    }).then(() => {
      setExplanationText('');
      setSelectedStudent(null);
      alert('Объяснительная отправлена!');
    });
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 pb-20 md:pb-0 md:pl-64">
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#0B0F19] border-r border-slate-800 p-4 justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
              CLASS CONTROL
            </h1>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              LIVE
            </span>
          </div>

          <nav className="space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <LayoutDashboard className="w-5 h-5" />
              <span>Главная</span>
            </button>
            <button onClick={() => setActiveTab('attendance')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm ${activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Users className="w-5 h-5" />
              <span>Посещаемость</span>
            </button>
            <button onClick={() => setActiveTab('ranking')} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm ${activeTab === 'ranking' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Award className="w-5 h-5" />
              <span>Рейтинг</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2">Переключить роль:</p>
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
            <option value="STUDENT">Ученик</option>
            <option value="STAROSTA">Староста</option>
            <option value="TEACHER">Учитель</option>
          </select>
        </div>
      </aside>

      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              {activeTab === 'dashboard' && 'Дашборд класса'}
              {activeTab === 'attendance' && 'Учёт посещаемости'}
              {activeTab === 'ranking' && 'Рейтинг 0–100'}
            </h2>
            <p className="text-xs text-slate-400">Class Control</p>
          </div>
          <span className="text-xs px-3 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-lg">
            Роль: {role}
          </span>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Всего учеников</p>
              <p className="text-2xl font-bold mt-1">36</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Присутствуют</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {students.filter(s => s.attendance[0] === 'PRESENT').length}
              </p>
            </div>
            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Опоздали</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {students.filter(s => s.attendance[0] === 'LATE').length}
              </p>
            </div>
            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400">Отсутствуют</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {students.filter(s => s.attendance[0] === 'ABSENT').length}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3">
          {students.map((student) => (
            <div key={student.id} className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <span className="text-xs font-mono text-slate-500 w-6">#{student.id}</span>
                <div>
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-xs text-slate-400">Рейтинг: {student.rating}/100</p>
                </div>
              </div>

              {role !== 'STUDENT' && (
                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                  <button onClick={() => updateAttendance(student.id, 'PRESENT')} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-lg hover:bg-emerald-500/20">
                    🟢 Присутствует
                  </button>
                  <button onClick={() => updateAttendance(student.id, 'LATE')} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs rounded-lg hover:bg-amber-500/20">
                    🟡 Опоздал
                  </button>
                  <button onClick={() => updateAttendance(student.id, 'FROM_LESSON_2')} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs rounded-lg hover:bg-indigo-500/20">
                    🔵 Со 2-го урока
                  </button>
                  {role === 'TEACHER' && (
                    <>
                      <button onClick={() => updateRating(student.id, 2)} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        +2
                      </button>
                      <button onClick={() => updateRating(student.id, -2)} className="px-2 py-1 bg-rose-600 text-white text-xs rounded">
                        -2
                      </button>
                    </>
                  )}
                </div>
              )}

              {role === 'STUDENT' && (
                <button onClick={() => setSelectedStudent(student)} className="text-xs text-indigo-400 hover:underline">
                  Написать объяснительную
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Объяснительная: {selectedStudent.name}</h3>
            <textarea
              value={explanationText}
              onChange={e => setExplanationText(e.target.value)}
              placeholder="Причина..."
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 mb-4 focus:outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">
                Отмена
              </button>
              <button onClick={() => sendExplanation(selectedStudent.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs">
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
