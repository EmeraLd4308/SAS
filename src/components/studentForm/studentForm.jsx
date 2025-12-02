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
            <h2>{editingId ? 'Редагувати дитину' : 'Додати дитину'}</h2>

            <form onSubmit={handleSubmit} className="form-vertical">
                <label>
                    <input
                        placeholder="Адреса дитини"
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleFormChange}
                        required
                    />
                </label>

                <label>
                    <input
                        placeholder="ПІБ дитини"
                        type="text"
                        name="child_name"
                        value={formData.child_name}
                        onChange={handleFormChange}
                        required
                    />
                </label>

                <label>
                    <input
                        placeholder="ПІБ одного із батьків"
                        type="text"
                        name="parent_name"
                        value={formData.parent_name}
                        onChange={handleFormChange}
                    />
                </label>

                <div className="date-gender-row">
                    <span>Дата нар.</span>
                    <label className="date-field">
                        <input
                            type="date"
                            name="birth_date"
                            value={formData.birth_date}
                            onChange={handleFormChange}
                            required
                        />
                    </label>

                    <div className="gender-block">
                        <span>|ㅤСтать</span>
                        <label className="gender-option">
                            <input
                                type="radio"
                                name="gender"
                                value="Ч"
                                checked={formData.gender === "Ч"}
                                onChange={handleFormChange}
                            />
                            <span>Ч</span>
                        </label>

                        <label className="gender-option">
                            <input
                                type="radio"
                                name="gender"
                                value="Ж"
                                checked={formData.gender === "Ж"}
                                onChange={handleFormChange}
                            />
                            <span>Ж</span>
                        </label>
                    </div>
                </div>

                <div className="button-row">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={onCancelEdit}
                    >
                        Скасувати
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="save-button"
                    >
                        {loading ? 'Обробка...' : (editingId ? 'Оновити' : 'Зберегти')}
                    </button>
                </div>
            </form>
        </div>
    );
}