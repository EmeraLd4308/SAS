import { useState } from 'react';
import './filter.scss';
import filterIcon from '../../assets/icons/filter.svg';


export function FiltersButton({
                                  genderFilter,
                                  onGenderFilterChange,
                                  dateFrom,
                                  onDateFromChange,
                                  dateTo,
                                  onDateToChange,
                                  onResetFilters
                              }) {
    const [isOpen, setIsOpen] = useState(false);

    // Правильна перевірка активних фільтрів
    const hasActiveFilters =
        genderFilter !== 'all' ||
        (dateFrom !== '' && dateFrom !== undefined) ||
        (dateTo !== '' && dateTo !== undefined);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleApply = () => {
        setIsOpen(false);
    };

    return (
        <div className="filters-container">
            {/* Показуємо або кнопку "Фільтри", або "Очистити фільтри" */}
            {hasActiveFilters ? (
                <button
                    className="clear-filters-button"
                    onClick={onResetFilters}
                    title="Очистити всі фільтри"
                >
                    <span>Очистити фільтри</span>
                    <span className="clear-icon">✕</span>
                </button>
            ) : (
                <button
                    className="filters-toggle-button"
                    onClick={() => setIsOpen(true)}
                    title="Показати фільтри"
                >
                    <img src={filterIcon} alt="" width="40" height="40" />
                </button>
            )}

            {/* Випадаюча панель фільтрів з напівпрозорим фоном */}
            {isOpen && (
                <>
                    {/* Напівпрозорий фон */}
                    <div
                        className="filters-overlay"
                        onClick={handleClose}
                    />

                    {/* Модальне вікно фільтрів */}
                    <div className="filters-panel">
                        <div className="filters-content">
                            <div className="filter-header">
                                <h3>Фільтри</h3>
                                <button
                                    className="close-button"
                                    onClick={handleClose}
                                    title="Закрити"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="filter-group">
                                <label htmlFor="genderFilter">Фільтр по Статі</label>
                                <select
                                    id="genderFilter"
                                    value={genderFilter}
                                    onChange={(e) => onGenderFilterChange(e.target.value)}
                                >
                                    <option value="all">Усі</option>
                                    <option value="Ч">Чоловіча (Ч)</option>
                                    <option value="Ж">Жіноча (Ж)</option>
                                </select>
                            </div>

                            <div className="filter-group date-group">
                                <label htmlFor="dateFrom">Народження від</label>
                                <input
                                    type="date"
                                    id="dateFrom"
                                    value={dateFrom}
                                    onChange={(e) => onDateFromChange(e.target.value)}
                                />
                            </div>

                            <div className="filter-group date-group">
                                <label htmlFor="dateTo">Народження до</label>
                                <input
                                    type="date"
                                    id="dateTo"
                                    value={dateTo}
                                    onChange={(e) => onDateToChange(e.target.value)}
                                />
                            </div>

                            <div className="panel-actions">
                                <button
                                    className="apply-filters-btn"
                                    onClick={handleApply}
                                >
                                    Застосувати
                                </button>
                                <button
                                    className="cancel-filters-btn"
                                    onClick={handleClose}
                                >
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}