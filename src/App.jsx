import { useState, useEffect } from 'react';
// Імпортуємо всі функції API: Read, Delete, Create
import { getStudents, deleteStudent, addStudent } from './api/studentsApi';

// Базовий компонент, який обробляє ВЕСЬ функціонал обліку
function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    child_name: '',
    gender: '',
    birth_date: '',
    address: '',
    parent_name: '',
    parent_phone: '',
    seq_number: '', // Додаємо всі поля, які є у вашій БД
  });

  // --- 1. ЛОГІКА ЧИТАННЯ (R) ---
  async function loadStudents() {
    setLoading(true);
    const data = await getStudents();
    setStudents(data);
    setLoading(false);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  // --- 2. ЛОГІКА ДОДАВАННЯ (C) ---
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Викликаємо функцію додавання з API, використовуючи дані форми
    const { success, data } = await addStudent(formData);

    if (success) {
      alert('Учня успішно додано!');
      // Оновлюємо список учнів, додаючи новий об'єкт (data)
      setStudents([...students, data]);
      // Очищуємо форму
      setFormData({
        child_name: '', gender: '', birth_date: '', address: '',
        parent_name: '', parent_phone: '', seq_number: ''
      });
    } else {
      alert('Помилка додавання.');
    }
    setLoading(false);
  };

  // --- 3. ЛОГІКА ВИДАЛЕННЯ (D) ---
  const handleDelete = async (studentId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього учня?')) {
      const success = await deleteStudent(studentId);

      if (success) {
        setStudents(students.filter(s => s.id !== studentId));
        alert('Учня успішно видалено!');
      } else {
        alert('Помилка видалення.');
      }
    }
  };


  if (loading) return <h1 style={{ textAlign: 'center' }}>Завантаження даних...</h1>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎓 Система Обліку Учнів</h1>

      {/* ФОРМА ДОДАВАННЯ */}
      <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px', borderRadius: '5px' }}>
        <h2>Додати Нового Учня</h2>
        <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>

          <input type="text" name="child_name" placeholder="ПІБ Дитини" value={formData.child_name} onChange={handleFormChange} required />
          <input type="text" name="seq_number" placeholder="№ з/п" value={formData.seq_number} onChange={handleFormChange} />
          <input type="text" name="gender" placeholder="Стать" value={formData.gender} onChange={handleFormChange} />

          <input type="date" name="birth_date" placeholder="Дата народження" value={formData.birth_date} onChange={handleFormChange} required />
          <input type="text" name="address" placeholder="Адреса дитини" value={formData.address} onChange={handleFormChange} />
          <input type="text" name="parent_name" placeholder="ПІБ Батьків" value={formData.parent_name} onChange={handleFormChange} />

          <input type="text" name="parent_phone" placeholder="Телефон Батьків" value={formData.parent_phone} onChange={handleFormChange} />

          <button type="submit" disabled={loading} style={{ gridColumn: 'span 3', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Додавання...' : 'ЗБЕРЕГТИ УЧНЯ'}
          </button>
        </form>
      </div>

      {/* ТАБЛИЦЯ СПИСКУ УЧНІВ */}
      <h2>Список Учнів ({students.length})</h2>

      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>№ з/п</th>
            <th>ПІБ Дитини</th>
            <th>Стать</th>
            <th>Дата народження</th>
            <th>Адреса</th>
            <th>ПІБ Батьків</th>
            <th>Телефон</th>
            <th>Дія</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.seq_number}</td>
              <td>{student.child_name}</td>
              <td>{student.gender}</td>
              <td>{student.birth_date}</td>
              <td>{student.address}</td>
              <td>{student.parent_name}</td>
              <td>{student.parent_phone}</td>
              <td>
                {/* Кнопка Видалення */}
                <button
                  onClick={() => handleDelete(student.id)}
                  style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                >
                  Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;