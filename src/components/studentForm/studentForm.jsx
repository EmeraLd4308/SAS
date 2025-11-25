import { useState } from 'react';
import './studentForm.scss';

const initialFormData = {
    child_name: '',
    gender: '',
    birth_date: '',
    address: '',
    parent_name: '',
};

export function StudentForm({
    onSubmit,
    editingId,
    onCancelEdit,
    formData: externalFormData,
    onFormChange,
    loading
}) {
    const [localFormData, setLocalFormData] = useState(initialFormData);

    const formData = externalFormData || localFormData;
    const setFormData = onFormChange || setLocalFormData;

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="student-form-card">
            <h2>{editingId ? 'Редагувати Учня' : 'Додати Нового Учня'}</h2>

            {editingId && (
                <button onClick={onCancelEdit} className="cancel-edit-button">
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
    );
}