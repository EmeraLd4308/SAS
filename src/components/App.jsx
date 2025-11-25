import { useState, useEffect, useCallback } from 'react';
import { getStudents, deleteStudent, addStudent, updateStudent } from '../services/StudentsService';
import { exportToExcel } from '../services/ExportService';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { DeleteWindow } from './deleteWindow/deleteWindow';
import { StudentForm } from './studentForm/studentForm';
import { TableControls } from './tableControls/tableControls';
import { StudentTable } from './studentTable/studentTable';
import { Pagination } from './pagination/pagination';
import '../styles/styles.scss';

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

  // --- ЛОГІКА ЧИТАННЯ ---
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

  // Завантаження даних при зміні параметрів
  useEffect(() => {
    loadStudents();
  }, [sortBy, sortOrder, genderFilter, dateFrom, dateTo, loadStudents]);

  useEffect(() => {
    if (searchTerm !== undefined) {
      loadStudents();
    }
  }, [searchTerm, loadStudents]);

  // --- ЛОГІКА ФОРМИ ---
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
      }
    } catch (error) {
      success = false;
      message = 'Сталася помилка при збереженні';
    } finally {
      setModalState({ message, action: null, id: null });
      setLoading(false);
    }
  };

  // --- ЛОГІКА РЕДАГУВАННЯ ---
  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({
      child_name: student.child_name || '',
      gender: student.gender || '',
      birth_date: student.birth_date ? student.birth_date.slice(0, 10) : '',
      address: student.address || '',
      parent_name: student.parent_name || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormData);
  };

  // --- ЛОГІКА ВИДАЛЕННЯ ---
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

  // --- ЕКСПОРТ В EXCEL ---
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

  // --- СКИДАННЯ ФІЛЬТРІВ ---
  const resetFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('id');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(students.length / itemsPerPage);

  if (loading && students.length === 0) {
    return (
      <div className="app-container">
        <Header />
        <div className="main-content">
          <h1 className="loading-message">Завантаження даних</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />

      <div className="main-content">
        <DeleteWindow
          message={modalState.message}
          onConfirm={modalState.action === 'DELETE' ? executeDelete : null}
          onCancel={closeModal}
        />

        <StudentForm
          onSubmit={handleFormSubmit}
          editingId={editingId}
          onCancelEdit={handleCancelEdit}
          formData={formData}
          onFormChange={setFormData}
          loading={loading}
        />

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

        <TableControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          genderFilter={genderFilter}
          onGenderFilterChange={setGenderFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {loading ? (
          <h1 className="loading-message">Завантаження даних</h1>
        ) : students.length === 0 ? (
          <p className="no-data">Немає жодного учня, що відповідає критеріям пошуку/фільтрації.</p>
        ) : (
          <>
            <StudentTable
              students={students}
              onEdit={handleEdit}
              onDelete={confirmDelete}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;