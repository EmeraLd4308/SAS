import { useState, useEffect, useCallback } from 'react'
import { getStudents, deleteStudent, addStudent, updateStudent } from '../services/StudentsService'
import { exportToExcel } from '../services/ExportService'
import { Header } from './header/header'
import { Footer } from './footer/footer'
import { DeleteWindow } from './deleteWindow/deleteWindow'
import { StudentForm } from './studentForm/studentForm'
import { TableControls } from './tableControls/tableControls'
import { StudentTable } from './studentTable/studentTable'
import '../styles/styles.scss'

const initialFormData = {
  child_name: '',
  gender: '',
  birth_date: '',
  address: '',
  parent_name: '',
};

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [genderFilter, setGenderFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [yearFilter, setYearFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [modalState, setModalState] = useState({message: null, action: null, id: null});

  // Завантаження фільтрів з localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('studentFilters');
    if (savedFilters) {
      const { search, gender, sortBy: savedSortBy, sortOrder: savedSortOrder, year } = JSON.parse(savedFilters);
      setSearchTerm(search || '');
      setGenderFilter(gender || 'all');
      setSortBy(savedSortBy || 'id');
      setSortOrder(savedSortOrder || 'asc');
      setYearFilter(year || null);
    }
  }, []);

  // Збереження фільтрів в localStorage
  useEffect(() => {
    const filters = {
      search: searchTerm,
      gender: genderFilter,
      sortBy,
      sortOrder,
      year: yearFilter
    };
    localStorage.setItem('studentFilters', JSON.stringify(filters));
  }, [searchTerm, genderFilter, sortBy, sortOrder, yearFilter]);

  // Функція сортування
  const handleSort = (column, order) => {
    setSortBy(column);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Функція завантаження студентів
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents(
          sortBy,
          sortOrder === 'asc',
          searchTerm,
          genderFilter,
          dateFrom,
          dateTo,
          yearFilter
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
  }, [sortBy, sortOrder, searchTerm, genderFilter, dateFrom, dateTo, yearFilter]);

  // Завантаження студентів при зміні фільтрів
  useEffect(() => {
    loadStudents();
  }, [sortBy, sortOrder, genderFilter, dateFrom, dateTo, yearFilter, loadStudents]);

  // Завантаження студентів при зміні пошуку
  useEffect(() => {
    if (searchTerm !== undefined) {
      const timer = setTimeout(() => {
        loadStudents();
      }, 300); // Debounce 300ms

      return () => clearTimeout(timer);
    }
  }, [searchTerm, loadStudents]);

  // Обробка збереження форми
  const handleFormSubmit = async (formData) => {
    if (!formData.child_name.trim() || !formData.birth_date) {
      setModalState({ message: 'Заповніть обовʼязкові поля', action: null, id: null });
      return;
    }
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
        setIsFormOpen(false);
      }
    } catch (error) {
      success = false;
      message = 'Сталася помилка при збереженні';
    } finally {
      setModalState({ message, action: null, id: null });
      setLoading(false);
    }
  };

  // Відкриття форми для додавання
  const handleAddClick = () => {
    setIsFormOpen(true);
    setEditingId(null);
    setFormData(initialFormData);
  };

  // Фільтрація за роком
  const handleYearFilter = (year) => {
    setYearFilter(year);
    setCurrentPage(1);
  };

  // Редагування студента
  const handleEdit = (student) => {
    setEditingId(student.id);
    setIsFormOpen(true);
    setFormData({
      child_name: student.child_name || '',
      gender: student.gender || '',
      birth_date: student.birth_date ? student.birth_date.slice(0, 10) : '',
      address: student.address || '',
      parent_name: student.parent_name || '',
    });
  };

  // Скасування редагування
  const handleCancelEdit = () => {
    setEditingId(null);
    setIsFormOpen(false);
    setFormData(initialFormData);
  };

  // Підтвердження видалення
  const confirmDelete = (studentId) => {
    setModalState({
      message: 'Ви впевнені, що хочете видалити цю дитину?',
      action: 'DELETE',
      id: studentId
    });
  };

  // Виконання видалення
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

  // Закриття модального вікна
  const closeModal = () => {
    setModalState({ message: null, action: null, id: null });
  };

  // Експорт до Excel
  const handleExport = async () => {
    const result = await exportToExcel({
      searchTerm,
      genderFilter: genderFilter !== 'all' ? genderFilter : '',
      dateFrom,
      dateTo,
      yearFilter
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

  // Скидання всіх фільтрів
  const resetFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setDateFrom('');
    setDateTo('');
    setYearFilter(null);
    setSortBy('id');
    setSortOrder('asc');
    setCurrentPage(1);
    setItemsPerPage(10);
  };

  // Розрахунок загальної кількості сторінок
  const totalPages = Math.ceil(students.length / itemsPerPage);

  // Показати завантаження якщо дані ще не завантажені
  if (loading && students.length === 0) {
    return (
        <div className="app-container">
          <Header onYearFilter={handleYearFilter} />
          <div className="main-content">
            <h1 className="loading-message">Завантаження даних</h1>
          </div>
          <Footer />
        </div>
    );
  }

  return (
      <div className="app-container">
        <Header onYearFilter={handleYearFilter} />

        <div className="main-content">
          <DeleteWindow
              message={modalState.message}
              onConfirm={modalState.action === 'DELETE' ? executeDelete : null}
              onCancel={closeModal}
          />

          <TableControls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              genderFilter={genderFilter}
              onGenderFilterChange={setGenderFilter}
              dateFrom={dateFrom}
              onDateFromChange={setDateFrom}
              dateTo={dateTo}
              onDateToChange={setDateTo}
              onResetFilters={resetFilters}
              onAddClick={handleAddClick}
          />

          {(isFormOpen || editingId !== null) && (
              <StudentForm
                  onSubmit={handleFormSubmit}
                  editingId={editingId}
                  onCancelEdit={handleCancelEdit}
                  formData={formData}
                  onFormChange={setFormData}
                  loading={loading}
              />
          )}

          {loading ? (
              <h1 className="loading-message">Завантаження даних</h1>
          ) : students.length === 0 ? (
              <p className="no-data">Немає жодного учня, що відповідає критеріям пошуку/фільтрації.</p>
          ) : (
              <StudentTable
                  students={students}
                  onEdit={handleEdit}
                  onDelete={confirmDelete}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onExport={handleExport}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
              />
          )}
        </div>

        <Footer onYearFilter={handleYearFilter} />
      </div>
  );
}

export default App;