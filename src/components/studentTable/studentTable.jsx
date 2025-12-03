import editIcon from '../../assets/icons/edit.png';
import deleteIcon from '../../assets/icons/delete.svg';
import './studentTable.scss';

export function StudentTable({students, onEdit, onDelete, currentPage, itemsPerPage, sortBy = 'id', sortOrder = 'asc', onSort = () => {}, onExport, onPageChange, onItemsPerPageChange, itemsPerPageOptions = [5, 10, 20, 50, 100, 200, 400, 600, 800]}) {
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);

    const handleSortClick = (columnName) => {
        if (onSort) {
            let newOrder = 'asc';
            if (sortBy === columnName) {
                newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            }
            onSort(columnName, newOrder);
        }
    };
    const handleItemsPerPageChange = (e) => {
        const newItemsPerPage = parseInt(e.target.value);
        onItemsPerPageChange(newItemsPerPage);
        onPageChange(1);
    };

    // Розрахунок інформації про елементи
    const startItem = indexOfFirstItem + 1;
    const endItem = Math.min(indexOfLastItem, students.length);
    const totalItems = students.length;

    return (
        <>
            <table className="student-table">
                <thead>
                <tr>
                    <th onClick={() => handleSortClick('id')} className="sortable">
                        №З/П
                        {sortBy === 'id' && (<span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
                    <th onClick={() => handleSortClick('child_name')} className="sortable">
                        ПІБ Дитини
                        {sortBy === 'child_name' && (<span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
                    <th>Стать</th>
                    <th onClick={() => handleSortClick('birth_date')} className="sortable">
                        Дата нар.
                        {sortBy === 'birth_date' && (<span className="sort-icon">{sortOrder === 'asc' ? '▲' : '▼'}</span>)}
                    </th>
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
                            <button onClick={() => onEdit(student)} className="edit-button">
                                <img src={editIcon} alt="Редагувати" width="20" height="20" />
                            </button>
                            <button onClick={() => onDelete(student.id)} className="delete-button">
                                <img src={deleteIcon} alt="Видалити" width="20" height="20" />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
                
                <tfoot>
                <tr>
                    <td colSpan="7" className="table-footer">
                        <div className="footer-content">
                            <button onClick={onExport} className="export-button" disabled={students.length === 0}>
                                Експортувати в Excel
                            </button>

                            <div className="items-per-page-controls">
                                <div className="items-per-page-selector">
                                    <label htmlFor="itemsPerPage">Дітей на сторінці:</label>
                                    <select id="itemsPerPage" value={itemsPerPage} onChange={handleItemsPerPageChange} className="items-select">
                                        {itemsPerPageOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                                    </select>
                                </div>
                            </div>
                            
                        </div>
                    </td>
                </tr>
                </tfoot>
                
            </table>
        </>
    );
}
