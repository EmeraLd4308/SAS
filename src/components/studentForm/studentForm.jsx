import { useState, useRef } from 'react';
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
    const buttonRef = useRef(null);

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

    const getHoverDirection = (e, element) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const width = element.offsetWidth;
        const height = element.offsetHeight;

        const top = y < height / 3;
        const bottom = y > height * 2 / 3;
        const left = x < width / 3;
        const right = x > width * 2 / 3;

        if (top) return 'top';
        if (bottom) return 'bottom';
        if (left) return 'left';
        if (right) return 'right';

        return 'top';
    };

    const handleMouseEnter = (e) => {
        const direction = getHoverDirection(e, e.currentTarget);
        e.currentTarget.setAttribute('data-hover-direction', direction);
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.setAttribute('data-hover-direction', '');
    };

    return (
        <div className="student-form-card">
            <h2>{editingId ? 'Редагувати дитину' : 'Додати дитину'}</h2>

            {editingId && (
                <button onClick={onCancelEdit} className="cancel-edit-button">
                    Скасувати Редагування
                </button>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
                <input
                    type="text"
                    name="child_name"
                    placeholder="ПІБ Дитини *"
                    value={formData.child_name}
                    onChange={handleFormChange}
                    required
                />

                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                >
                    <option value="">Оберіть стать</option>
                    <option value="Ч">Чоловіча</option>
                    <option value="Ж">Жіноча</option>
                </select>

                <input
                    type="date"
                    name="birth_date"
                    placeholder="Дата народження *"
                    value={formData.birth_date}
                    onChange={handleFormChange}
                    required
                />
                <input
                    type="text"
                    name="address"
                    placeholder="Адреса дитини"
                    value={formData.address}
                    onChange={handleFormChange}
                />
                <input
                    type="text"
                    name="parent_name"
                    placeholder="ПІБ Батьків"
                    value={formData.parent_name}
                    onChange={handleFormChange}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="form-button"
                    ref={buttonRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {loading ? 'Обробка...' : (editingId ? 'Оновити дані' : 'Зберегти дитину')}
                </button>
            </form>
        </div>
    );
}