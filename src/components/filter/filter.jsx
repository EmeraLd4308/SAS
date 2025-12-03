import { useState } from 'react';
import filterIcon from '../../assets/icons/filter.svg';
import clearIcon from '../../assets/icons/clear.svg';
import './filter.scss';

export function FiltersButton({genderFilter, onGenderFilterChange, dateFrom, onDateFromChange, dateTo, onDateToChange, onResetFilters}) {
    
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveFilters = genderFilter !== 'all' || (dateFrom !== '' && dateFrom !== undefined) || (dateTo !== '' && dateTo !== undefined);
    
    const handleApply = () => {
        setIsOpen(false);
    };
    const handleCancel = () => {
        onResetFilters();
        setIsOpen(false);
    };

    return (
        <div className="filters-container">
            {hasActiveFilters ? (
                <button className="clear-filters-button" onClick={onResetFilters} title="Очистити всі фільтри">
                    <img src={clearIcon} alt="" width="40" height="40" />
                </button>
            ) : (
                <button className="filters-toggle-button" onClick={() => setIsOpen(true)} title="Показати фільтри">
                    <img src={filterIcon} alt="" width="40" height="40" />
                </button>
            )}

            {isOpen && (
                <>
                    <div className="filters-overlay"/>

                    <div className="filters-panel">
                        <div className="filters-content">
                            
                            <div className="filter-header">
                                <h3>Фільтр</h3>
                            </div>
                            
                            <div className="filter-group">
                                <label htmlFor="genderFilter">По cтаті</label>
                                <select id="genderFilter" value={genderFilter} onChange={(e) => onGenderFilterChange(e.target.value)}>
                                    <option value="all">Усі</option>
                                    <option value="Ч">Чоловіча (Ч)</option>
                                    <option value="Ж">Жіноча (Ж)</option>
                                </select>
                            </div>

                            <div className="filter-group date-group">
                                <label htmlFor="dateFrom">Народження від</label>
                                <input type="date" id="dateFrom" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)}/>
                            </div>

                            <div className="filter-group date-group">
                                <label htmlFor="dateTo">Народження до</label>
                                <input type="date" id="dateTo" value={dateTo} onChange={(e) => onDateToChange(e.target.value)}/>
                            </div>

                            <div className="panel-actions">
                                <button className="cancel-filters-btn" onClick={handleCancel}>Скасувати</button>
                                <button className="apply-filters-btn" onClick={handleApply}>Застосувати</button>
                            </div>
                            
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
