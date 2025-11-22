import { useState, useEffect, useCallback, useRef } from 'react';
import { getStudents, deleteStudent, addStudent, updateStudent } from '../services/StudentsService';
import { exportToExcel } from '../services/ExportService';
import '../styles/styles.scss';

const initialFormData = {
  child_name: '',
  gender: '',
  birth_date: '',
  address: '',
  parent_name: '',
};

// ХУК ДЛЯ УПОКУВАННЯ ВВЕДЕННЯ (DEBOUNCE HOOK)
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

// Компонент Повідомлення/Модального Вікна
function Modal({ message, onConfirm, onCancel }) {
  if (!message) return null;
  const isConfirm = typeof onConfirm === 'function';

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

// Головний Компонент Додатку
function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);

  // Стани для пошуку, сортування та фільтрів
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [genderFilter, setGenderFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Пагінація
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [modalState, setModalState] = useState({
    message: null,
    action: null,
    id: null
  });

  // Завантаження стану з localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('studentFilters');
    if (savedFilters) {
      const { search, gender, sortBy: savedSortBy, sortOrder: savedSortOrder } = JSON.parse(savedFilters);
      setSearchTerm(search || '');
      setGenderFilter(gender || 'all');
      setSortBy(savedSortBy || 'id');
      setSortOrder(savedSortOrder || 'asc');
    }
  }, []);

  // Збереження стану в localStorage
  useEffect(() => {
    const filters = {
      search: searchTerm,
      gender: genderFilter,
      sortBy,
      sortOrder
    };
    localStorage.setItem('studentFilters', JSON.stringify(filters));
  }, [searchTerm, genderFilter, sortBy, sortOrder]);

  // --- 1. ЛОГІКА ЧИТАННЯ (R) з параметрами ---
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents(
        sortBy,
        sortOrder === 'asc',
        searchTerm,
        genderFilter,
        dateFrom,
        dateTo
      );
      setStudents(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Помилка завантаження:', error);
      setModalState({ message: 'Помилка завантаження даних', action: null, id: null });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, searchTerm, genderFilter, dateFrom, dateTo]);

  // Debounce для пошуку
  const debouncedSearch = useDebounce((value) => {
    setSearchTerm(value);
  }, 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Завантаження даних при зміні параметрів
  useEffect(() => {
    loadStudents();
  }, [sortBy, sortOrder, genderFilter, dateFrom, dateTo, loadStudents]);

  useEffect(() => {
    if (searchTerm !== undefined) {
      loadStudents();
    }
  }, [searchTerm, loadStudents]);

  // --- 2. ВАЛІДАЦІЯ ФОРМИ ---
  const validateForm = () => {
    if (!formData.child_name.trim()) {
      setModalState({ message: 'Введіть ПІБ дитини', action: null, id: null });
      return false;
    }
    if (!formData.birth_date) {
      setModalState({ message: 'Виберіть дату народження', action: null, id: null });
      return false;
    }
    return true;
  };

  // --- 3. ЛОГІКА ФОРМИ ---
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    let success, message;

    try {
      if (editingId) {
        const result = await updateStudent(editingId, formData);
        success = result.success;
        message = success ? 'Учня успішно оновлено!' : 'Помилка оновлення.';
      } else {
        const result = await addStudent(formData);
        success = result.success;
        message = success ? 'Учня успішно додано!' : 'Помилка додавання.';
      }

      if (success) {
        loadStudents();
        setFormData(initialFormData);
        setEditingId(null);
      }
    } catch (error) {
      success = false;
      message = 'Сталася помилка при збереженні';
    } finally {
      setModalState({ message, action: null, id: null });
      setLoading(false);
    }
  };

  // --- 4. ЛОГІКА РЕДАГУВАННЯ ---
  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      child_name: student.child_name || '',
      gender: student.gender || '',
      birth_date: student.birth_date ? student.birth_date.slice(0, 10) : '',
      address: student.address || '',
      parent_name: student.parent_name || '',
    });
    document.querySelector('.student-form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormData);
  };

  // --- 5. ЛОГІКА ВИДАЛЕННЯ ---
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

    try {
      const success = await deleteStudent(studentId);
      if (success) {
        loadStudents();
        setModalState({ message: 'Учня успішно видалено!', action: null, id: null });
      } else {
        setModalState({ message: 'Помилка видалення.', action: null, id: null });
      }
    } catch (error) {
      setModalState({ message: 'Помилка видалення.', action: null, id: null });
    }
  };

  const closeModal = () => {
    setModalState({ message: null, action: null, id: null });
  };

  // --- 6. ЕКСПОРТ В EXCEL ---
  const handleExport = async () => {
    const result = await exportToExcel({
      searchTerm,
      genderFilter: genderFilter !== 'all' ? genderFilter : '',
      dateFrom,
      dateTo
    });

    if (result.success) {
      setModalState({
        message: `Експортовано ${result.count} записів у файл "${result.fileName}"`,
        action: null,
        id: null
      });
    } else {
      setModalState({
        message: 'Помилка експорту даних',
        action: null,
        id: null
      });
    }
  };

  // --- 7. ПАГІНАЦІЯ ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- 8. СКИДАННЯ ФІЛЬТРІВ ---
  const resetFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('id');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Підказки для пошуку
  const searchSuggestions = [
    'Іван',
    'Марія',
    'Київ',
    'Львів'
  ].filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 3);

  // Виведення даних
  if (loading && students.length === 0) {
    return <h1 className="loading-message">Завантаження даних</h1>;
  }

  return (
    <div className="app-container">
      <Modal
        message={modalState.message}
        onConfirm={modalState.action === 'DELETE' ? executeDelete : null}
        onCancel={closeModal}
      />

      {/* ФОРМА ДОДАВАННЯ/РЕДАГУВАННЯ */}
      <div className="student-form-card">
        <h2>{editingId ? 'Редагувати Учня' : 'Додати Нового Учня'}</h2>

        {editingId && (
          <button onClick={handleCancelEdit} className="cancel-edit-button">
            Скасувати Редагування
          </button>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <input type="text" name="child_name" placeholder="ПІБ Дитини *" value={formData.child_name} onChange={handleFormChange} required />

          <select name="gender" value={formData.gender} onChange={handleFormChange}>
            <option value="">Оберіть стать</option>
            <option value="Ч">Чоловіча</option>
            <option value="Ж">Жіноча</option>
          </select>

          <input type="date" name="birth_date" placeholder="Дата народження *" value={formData.birth_date} onChange={handleFormChange} required />
          <input type="text" name="address" placeholder="Адреса дитини" value={formData.address} onChange={handleFormChange} />
          <input type="text" name="parent_name" placeholder="ПІБ Батьків" value={formData.parent_name} onChange={handleFormChange} />

          <button type="submit" disabled={loading} className="form-button">
            {loading ? 'Обробка...' : (editingId ? 'ОНОВИТИ ДАНІ' : 'ЗБЕРЕГТИ УЧНЯ')}
          </button>
        </form>
      </div>

      {/* КНОПКИ ПОШУКУ/СОРТУВАННЯ/ФІЛЬТРАЦІЇ */}
      <div className="table-header">
        <h2>Список Учнів ({students.length})</h2>
        <div className="header-actions">
          <button onClick={handleExport} className="export-button" disabled={students.length === 0}>
            Експорт в Excel
          </button>
          <button onClick={resetFilters} className="reset-filters-btn">
            Скинути фільтри
          </button>
        </div>
      </div>

      <div className="table-controls">
        {/* Пошук з підказками */}
        <div className="control-group search-control">
          <label htmlFor="search">Пошук (ПІБ, Адреса)</label>
          <div className="search-wrapper">
            <input
              type="text"
              id="search"
              placeholder="Введіть пошуковий запит..."
              defaultValue={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => {
                      setSearchTerm(suggestion);
                      document.getElementById('search').value = suggestion;
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
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
            <option value="id">ID</option>
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

        {/* Пагінація: Елементів на сторінці */}
        <div className="control-group">
          <label htmlFor="itemsPerPage">Елементів на сторінці</label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* ТАБЛИЦЯ СПИСКУ УЧНІВ */}
      {loading ? (
        <h1 className="loading-message">Завантаження даних</h1>
      ) : students.length === 0 ? (
        <p className="no-data">Немає жодного учня, що відповідає критеріям пошуку/фільтрації.</p>
      ) : (
        <>
          <table className="student-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ПІБ Дитини</th>
                <th>Стать</th>
                <th>Дата народження</th>
                <th>Адреса</th>
                <th>ПІБ Батьків</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.child_name}</td>
                  <td>{student.gender}</td>
                  <td>{student.birth_date}</td>
                  <td>{student.address}</td>
                  <td>{student.parent_name}</td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleEdit(student)}
                      className="edit-button"
                    >
                      Редагувати
                    </button>
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

          {/* ПАГІНАЦІЯ */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Попередня
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => {
                  const showEllipsis = index < array.length - 1 && array[index + 1] - page > 1;
                  return (
                    <span key={page}>
                      <button
                        onClick={() => paginate(page)}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                      {showEllipsis && <span className="pagination-ellipsis">...</span>}
                    </span>
                  );
                })}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Наступна →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;