import './studentTable.scss';

export function StudentTable({
    students,
    onEdit,
    onDelete,
    currentPage,
    itemsPerPage
}) {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);

    return (
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
                            <button onClick={() => onEdit(student)} className="edit-button">Редагувати</button>
                            <button onClick={() => onDelete(student.id)} className="delete-button">Видалити</button>
                        </td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <th colSpan="7">
                        Експортувати таблицю в Excel
                    </th>
                </tr>
            </tfoot>
        </table>
    );
}