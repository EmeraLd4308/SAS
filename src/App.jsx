import { useState, useEffect, useCallback, useRef } from 'react';
import { getStudents, deleteStudent, addStudent, updateStudent } from './api/studentsApi';
import './App.scss';

const initialFormData = {
  child_name: '',
  gender: '',
  birth_date: '',
  address: '',
  parent_name: '',
  parent_phone: '',
  seq_number: '',
};

// =======================================================
// ХУК ДЛЯ УПОКУВАННЯ ВВЕДЕННЯ (DEBOUNCE HOOK)
// =======================================================
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}


// =======================================================
// Компонент Повідомлення/Модального Вікна
// =======================================================
function Modal({ message, onConfirm, onCancel }) {
  if (!message) return null;
  const isConfirm = typeof onConfirm === 'function';
  // ... (решта логіки Modal)
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          {isConfirm ? (
            <>
              <button className="btn-confirm" onClick={onConfirm}>Так, видалити</button>
              <button className="btn-cancel" onClick={onCancel}>Скасувати</button>
            </>
          ) : (
            <button className="btn-ok" onClick={onCancel}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
}

// =======================================================
// Головний Компонент Додатку
// =======================================================
function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);

  // Стани для пошуку, сортування та фільтрів
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('seq_number');
  const [sortOrder, setSortOrder] = useState('asc');
  const [genderFilter, setGenderFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [modalState, setModalState] = useState({
    message: null,
    action: null,
    id: null
  });

  // --- 1. ЛОГІКА ЧИТАННЯ (R) з параметрами ---
  const loadStudents = useCallback(async () => {
    setLoading(true);
    const data = await getStudents(
      sortBy,
      sortOrder === 'asc',
      searchTerm,
      genderFilter,
      dateFrom,
      dateTo
    );
    setStudents(data);
    setLoading(false);
  }, [sortBy, sortOrder, searchTerm, genderFilter, dateFrom, dateTo]);

  // Застосовуємо debounce для функції завантаження, щоб викликати її з затримкою
  const debouncedLoadStudents = useDebounce(loadStudents, 500);

  // Викликаємо функцію одразу при зміні фільтрів/сортування (крім searchTerm)
  useEffect(() => {
    // Якщо змінився будь-який параметр (крім searchTerm), оновлюємо одразу
    // Це забезпечує миттєве оновлення при виборі зі спадаючого списку (Стать, Сортування, Дати)
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, genderFilter, dateFrom, dateTo]);


  // Окрема useEffect для пошукового терміна, який викликається через debouncedLoadStudents
  useEffect(() => {
    // Реагує на зміну searchTerm і запускає оновлення через 500мс
    debouncedLoadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Обробник змін у полі пошуку
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Виклик loadStudents відбудеться автоматично через useEffect + debounce
  };


  // --- 2. ЛОГІКА ФОРМИ (Спільна для Create і Update) ---
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let success, message;

    if (editingId) {
      // РЕЖИМ ОНОВЛЕННЯ (U)
      const result = await updateStudent(editingId, formData);
      success = result.success;
      message = success ? 'Учня успішно оновлено!' : 'Помилка оновлення.';
    } else {
      // РЕЖИМ ДОДАВАННЯ (C)
      const result = await addStudent(formData);
      success = result.success;
      message = success ? 'Учня успішно додано!' : 'Помилка додавання. Перевірте RLS у Supabase!';
    }

    if (success) {
      loadStudents();
    }

    setModalState({ message: message, action: null, id: null });
    setFormData(initialFormData);
    setEditingId(null);
    setLoading(false);
  };

  // --- 3. ЛОГІКА РЕДАГУВАННЯ (U) ---
  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      child_name: student.child_name || '',
      gender: student.gender || '',
      birth_date: student.birth_date ? student.birth_date.slice(0, 10) : '',
      address: student.address || '',
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || '',
      seq_number: student.seq_number || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormData);
  };


  // --- 4. ЛОГІКА ВИДАЛЕННЯ (D) ---
  const confirmDelete = (studentId) => {
    setModalState({
      message: 'Ви впевнені, що хочете видалити цього учня?',
      action: 'DELETE',
      id: studentId
    });
  };

  const executeDelete = async () => {
    const studentId = modalState.id;
    setModalState({ message: null, action: null, id: null });

    const success = await deleteStudent(studentId);

    if (success) {
      loadStudents();
      setModalState({ message: 'Учня успішно видалено!', action: null, id: null });
    } else {
      setModalState({ message: 'Помилка видалення.', action: null, id: null });
    }
  };

  const closeModal = () => {
    setModalState({ message: null, action: null, id: null });
  };

  // Виведення даних
  if (loading && students.length === 0) return <h1 className="loading-message">Завантаження даних...</h1>;

  return (
    <div className="app-container">

      {/* Кастомне Модальне Вікно */}
      <Modal
        message={modalState.message}
        onConfirm={modalState.action === 'DELETE' ? executeDelete : null}
        onCancel={closeModal}
      />

      <h1>Облік дітей шкільного та дошкільного віку</h1>

      {/* ФОРМА ДОДАВАННЯ/РЕДАГУВАННЯ */}
      <div className="student-form-card">
        <h2>{editingId ? 'Редагувати Учня' : 'Додати Нового Учня'}</h2>

        {editingId && (
          <button onClick={handleCancelEdit} className="cancel-edit-button">
            Скасувати Редагування
          </button>
        )}

        <form onSubmit={handleSubmit} className="form-grid">

          <input type="text" name="child_name" placeholder="ПІБ Дитини" value={formData.child_name} onChange={handleFormChange} required />
          <input type="text" name="seq_number" placeholder="№ з/п" value={formData.seq_number} onChange={handleFormChange} />
          <input type="text" name="gender" placeholder="Стать" value={formData.gender} onChange={handleFormChange} />

          <input type="date" name="birth_date" placeholder="Дата народження" value={formData.birth_date} onChange={handleFormChange} required />
          <input type="text" name="address" placeholder="Адреса дитини" value={formData.address} onChange={handleFormChange} />
          <input type="text" name="parent_name" placeholder="ПІБ Батьків" value={formData.parent_name} onChange={handleFormChange} />

          <input type="text" name="parent_phone" placeholder="Телефон Батьків" value={formData.parent_phone} onChange={handleFormChange} />

          <button type="submit" disabled={loading} className="form-button">
            {loading ? 'Обробка...' : (editingId ? 'ОНОВИТИ ДАНІ' : 'ЗБЕРЕГТИ УЧНЯ')}
          </button>
        </form>
      </div>

      {/* КНОПКИ ПОШУКУ/СОРТУВАННЯ/ФІЛЬТРАЦІЇ */}
      <h2>Список Учнів ({students.length})</h2>

      <div className="table-controls">

        {/* Пошук */}
        <div className="control-group search-control">
          <label htmlFor="search">Пошук (ПІБ, Адреса)</label>
          <input
            type="text"
            id="search"
            placeholder="Введіть пошуковий запит..."
            value={searchTerm}
            onChange={handleSearchChange} // Використовуємо debounced функцію
          />
        </div>

        {/* Фільтр за Статтю */}
        <div className="control-group">
          <label htmlFor="genderFilter">Фільтр по Статі</label>
          <select id="genderFilter" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="all">Усі</option>
            <option value="Ч">Чоловіча (Ч)</option>
            <option value="Ж">Жіноча (Ж)</option>
          </select>
        </div>

        {/* Фільтр: Дата від */}
        <div className="control-group date-control">
          <label htmlFor="dateFrom">Народження від</label>
          <input
            type="date"
            id="dateFrom"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        {/* Фільтр: Дата до */}
        <div className="control-group date-control">
          <label htmlFor="dateTo">Народження до</label>
          <input
            type="date"
            id="dateTo"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {/* Сортування: Поле */}
        <div className="control-group">
          <label htmlFor="sortBy">Сортувати за полем</label>
          <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="seq_number">№ з/п</option>
            <option value="child_name">ПІБ Дитини</option>
            <option value="birth_date">Датою народження</option>
            <option value="parent_name">ПІБ Батьків</option>
          </select>
        </div>

        {/* Сортування: Напрямок */}
        <div className="control-group">
          <label htmlFor="sortOrder">Напрямок</label>
          <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Зростання (A-Я/1-9)</option>
            <option value="desc">Спадання (Я-А/9-1)</option>
          </select>
        </div>
      </div>


      {/* ТАБЛИЦЯ СПИСКУ УЧНІВ */}
      {loading ? (
        <h1 className="loading-message">Завантаження даних...</h1>
      ) : students.length === 0 ? (
        <p>Немає жодного учня, що відповідає критеріям пошуку/фільтрації.</p>
      ) : (
        <table className="student-table">
          <thead>
            <tr>
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
                <td className="action-cell">
                  {/* Кнопка Редагувати */}
                  <button
                    onClick={() => handleEdit(student)}
                    className="edit-button"
                  >
                    Редагувати
                  </button>
                  {/* Кнопка Видалення */}
                  <button
                    onClick={() => confirmDelete(student.id)}
                    className="delete-button"
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;