import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './studentForm.scss';

const initialFormData = {
    child_name: '',
    gender: '',
    birth_date: '',
    address: '',
    parent_name: '',
};

export function StudentForm({onSubmit, editingId, onCancelEdit, formData: externalFormData, onFormChange, loading}) {
    const [localFormData, setLocalFormData] = useState(initialFormData);
    const [initialEditData, setInitialEditData] = useState(null);
    const formData = externalFormData || localFormData;
    const setFormData = onFormChange || setLocalFormData;

    useEffect(() => {
        if (editingId && externalFormData && !initialEditData) {
            setInitialEditData({...externalFormData});
        }
    }, [editingId, externalFormData]);

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateName = (name) => {
        if (name.length < 2) {
            return 'ПІБ повинно містити мінімум 2 символи';
        }
        const invalidPattern = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        if (invalidPattern.test(name)) {
            return 'ПІБ не повинно містити цифри або спеціальні символи';
        }
        return null;
    };

    const validateForm = () => {
        if (!formData.child_name.trim()) {
            toast.warning('Будь ласка, введіть ПІБ дитини', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }
        
        if (!formData.address.trim()) {
            toast.warning('Будь ласка, введіть адресу', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }
        
        if (!formData.birth_date) {
            toast.warning('Будь ласка, виберіть дату народження', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }
        
        if (!formData.gender) {
            toast.warning('Будь ласка, виберіть стать', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }

        if (formData.address.length < 5) {
            toast.error('Адреса повинна містити мінімум 5 символів', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }

        const childNameError = validateName(formData.child_name);
        if (childNameError) {
            toast.error(`${childNameError}`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return false;
        }

        if (formData.parent_name.trim()) {
            const parentNameError = validateName(formData.parent_name);
            if (parentNameError) {
                toast.error(`${parentNameError}`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                return false;
            }
        }

        if (editingId && initialEditData) {
            const isDataChanged = Object.keys(formData).some(key =>
                formData[key] !== initialEditData[key]
            );

            if (!isDataChanged) {
                toast.info('Нічого не змінено. Зробіть зміни перед оновленням.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                return false;
            }
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        onSubmit(formData);
    };

    const handleCancel = () => {
        if (editingId) setInitialEditData(null);
        onCancelEdit();
    };

    return (
        <div className="form-container">
            <div className="form-overlay"/>
            <div className="student-form-card">
                <h2>{editingId ? 'Редагувати дитину' : 'Додати дитину'}</h2>

                <form onSubmit={handleSubmit} className="form-vertical">
                    <label>
                        <input placeholder="Адреса дитини" type="text" name="address" value={formData.address} onChange={handleFormChange}/>
                    </label>

                    <label>
                        <input placeholder="ПІБ дитини" type="text" name="child_name" value={formData.child_name} onChange={handleFormChange}/>
                    </label>

                    <label>
                        <input placeholder="ПІБ одного із батьків" type="text" name="parent_name" value={formData.parent_name} onChange={handleFormChange}/>
                    </label>

                    <div className="date-gender-row">
                        <span>Дата нар.</span>

                        <label className="date-field">
                            <input type="date" name="birth_date" value={formData.birth_date} onChange={handleFormChange}/>
                        </label>

                        <div className="gender-block">
                            <span>|ㅤСтать</span>

                            <label className="gender-option">
                                <input type="radio" name="gender" value="Ч" checked={formData.gender === "Ч"} onChange={handleFormChange}/>
                                <span>Ч</span>
                            </label>

                            <label className="gender-option">
                                <input type="radio" name="gender" value="Ж" checked={formData.gender === "Ж"} onChange={handleFormChange}/>
                                <span>Ж</span>
                            </label>
                        </div>
                    </div>

                    <div className="button-row">
                        <button type="button" className="cancel-button" onClick={handleCancel}>Скасувати</button>
                        <button type="submit" disabled={loading} className="save-button">{loading ? 'Обробка...' : (editingId ? 'Оновити' : 'Зберегти')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
