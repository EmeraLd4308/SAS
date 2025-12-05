import { useState, useEffect, useCallback } from 'react'
import { checkAccessKey, checkAuthSession, saveAuthSession, clearAuthSession, getRemainingTime } from '../services/authService'
import { getStudents, deleteStudent, addStudent, updateStudent } from '../services/studentsService'
import { TableControls } from './tableControls/tableControls'
import { DeleteWindow } from './deleteWindow/deleteWindow'
import { StudentTable } from './studentTable/studentTable'
import { exportToExcel } from '../services/exportService'
import { StudentForm } from './studentForm/studentForm'
import { SignIn } from './signIn/signIn'
import { Header } from './header/header'
import { Footer } from './footer/footer'
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
  const [activeYear, setActiveYear] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  useEffect(() => {
    const sessionValid = checkAuthSession();
    setIsAuthenticated(sessionValid);
    if (sessionValid) {
      const remainingTime = getRemainingTime();
      if (remainingTime > 0) {
        setTimeout(() => {
          clearAuthSession();
          window.location.reload();
        }, remainingTime + 100);
      }
    }
  }, []);

  useEffect(() => {
    const savedFilters = localStorage.getItem('studentFilters');
    if (savedFilters) {
      const { search, gender, sortBy: savedSortBy, sortOrder: savedSortOrder, year } = JSON.parse(savedFilters);
      setSearchTerm(search || '');
      setGenderFilter(gender || 'all');
      setSortBy(savedSortBy || 'id');
      setSortOrder(savedSortOrder || 'asc');
      const savedYear = year || null;
      setYearFilter(savedYear);
      setActiveYear(savedYear);
    }
  }, []);

  useEffect(() => {
    const filters = {search: searchTerm, gender: genderFilter, sortBy, sortOrder, year: yearFilter};
    localStorage.setItem('studentFilters', JSON.stringify(filters));
  }, [searchTerm, genderFilter, sortBy, sortOrder, yearFilter]);

  const loadStudents = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getStudents(sortBy, sortOrder === 'asc', searchTerm, genderFilter, dateFrom, dateTo, yearFilter);
      setStudents(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Помилка завантаження:', error);
      setModalState({ message: 'Помилка завантаження даних', action: null, id: null });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, searchTerm, genderFilter, dateFrom, dateTo, yearFilter, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStudents();
    }
  }, [sortBy, sortOrder, genderFilter, dateFrom, dateTo, yearFilter, loadStudents, isAuthenticated]);

  useEffect(() => {
    if (searchTerm !== undefined && isAuthenticated) {
      const timer = setTimeout(() => {
        loadStudents();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, loadStudents, isAuthenticated]);

  const handleLogin = (accessKey) => {
    try {
      checkAccessKey(accessKey);
      saveAuthSession();
      setIsAuthenticated(true);
      const remainingTime = getRemainingTime();
      setTimeout(() => {
        clearAuthSession();
        window.location.reload();
      }, remainingTime + 100);
    } catch (error) {
      if (error.message === 'EMPTY') {
        alert('Введіть ключ доступу!');
      } else if (error.message === 'WRONG') {
        alert('Невірний ключ доступу!');
      } else {
        alert('Помилка: ' + error.message);
      }
    }
  };
  
  const handleSort = (column, order) => {
    setSortBy(column);
    setSortOrder(order);
    setCurrentPage(1);
  };

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
        message = success ? 'Дитину успішно оновлено!' : 'Помилка оновлення.';
      } else {
        const result = await addStudent(formData);
        success = result.success;
        message = success ? 'Дитину успішно додано!' : 'Помилка додавання.';
      }
      if (success) {
        loadStudents();
        setFormData(initialFormData);
        setEditingId(null);
        setIsFormOpen(false);
      }
    } catch (error) {
      message = 'Сталася помилка при збереженні';
    } finally {
      setModalState({ message, action: null, id: null });
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsFormOpen(true);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleYearFilter = (year) => {
    setYearFilter(year);
    setActiveYear(year);
    setCurrentPage(1);
  };

  const resetActiveYear = () => {
    setActiveYear(null);
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setIsFormOpen(true);
    setFormData({child_name: student.child_name || '', gender: student.gender || '', birth_date: student.birth_date ? student.birth_date.slice(0, 10) : '', address: student.address || '', parent_name: student.parent_name || '',});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsFormOpen(false);
    setFormData(initialFormData);
  };

  const confirmDelete = (studentId) => {
    setModalState({
      message: 'Ви впевнені, що хочете видалити цю дитину?',
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
        setModalState({ message: 'Дитину успішно видалено!', action: null, id: null });
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

  const handleExport = async () => {
    const result = await exportToExcel({searchTerm, genderFilter: genderFilter !== 'all' ? genderFilter : '', dateFrom, dateTo, yearFilter});
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

  const resetFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setDateFrom('');
    setDateTo('');
    setYearFilter(null);
    setActiveYear(null);
    setSortBy('id');
    setSortOrder('asc');
    setCurrentPage(1);
    setItemsPerPage(10);
  };

  if (!isAuthenticated) {
    return (
        <div className="app-container"><SignIn onLogin={handleLogin}/></div>
    );
  }

  return (
      <div className="app-container">
        <Header onYearFilter={handleYearFilter} activeYear={activeYear} onResetActiveYear={resetActiveYear}/>
        <div className="main-content">
          <DeleteWindow message={modalState.message} onConfirm={modalState.action === 'DELETE' ? executeDelete : null} onCancel={closeModal}/>

          {loading && students.length === 0 ? (<div className="loading-message"><div className="loading-spinner"></div><div className="loading-text">Завантаження</div></div>) : (
              <>
                <TableControls searchTerm={searchTerm} onSearchChange={setSearchTerm} genderFilter={genderFilter} onGenderFilterChange={setGenderFilter} dateFrom={dateFrom} onDateFromChange={setDateFrom} dateTo={dateTo} onDateToChange={setDateTo} onResetFilters={resetFilters} onAddClick={handleAddClick}/>

                {(isFormOpen || editingId !== null) && (
                    <StudentForm onSubmit={handleFormSubmit} editingId={editingId} onCancelEdit={handleCancelEdit} formData={formData} onFormChange={setFormData} loading={loading}/>
                )}

                {loading ? (
                    <div className="loading-message"><div className="loading-spinner"></div><div className="loading-text">Оновлення даних</div></div>) : 
                    students.length === 0 ? (<p className="no-data">Немає жодного учня, що відповідає критеріям пошуку/фільтрації.</p>) : (
                    <StudentTable students={students} onEdit={handleEdit} onDelete={confirmDelete} currentPage={currentPage} itemsPerPage={itemsPerPage} sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} onExport={handleExport} totalPages={totalPages} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage}/>
                )}
              </>
          )}
        </div>
        <Footer onYearFilter={handleYearFilter} activeYear={activeYear} onResetActiveYear={resetActiveYear}/>
      </div>
  );
}

export default App;
