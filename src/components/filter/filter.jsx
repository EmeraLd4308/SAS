import { useState } from 'react'
import filterIcon from '@/assets/icons/filter.svg'
import cleanIcon from '@/assets/icons/clean.png'
import './filter.scss'

const ADDRESS_FILTER_OPTIONS = [{ value: 'all', label: 'Усі' }, { value: 'вовчинець', label: 'с. Вовчинець' }, { value: 'мигове', label: 'с. Мигове' }, { value: 'берегомет', label: 'с-ще Берегомет' }, { value: 'лекече', label: 'с. Лекече' }, { value: 'лопушна', label: 'с. Лопушна' }, { value: 'долішній шепіт', label: 'с. Долішній Шепіт' }, { value: 'велике', label: 'с. Велике' }, { value: 'заріччя', label: 'с. Заріччя' }, { value: 'лукавці', label: 'с. Лукавці' }, { value: 'майдан', label: 'с. Майдан' }, { value: 'вахнівці', label: 'с. Вахнівці' }];

export function FiltersButton({genderFilter, onGenderFilterChange, addressFilter = 'all', onAddressFilterChange, dateFrom, onDateFromChange, dateTo, onDateToChange, onResetFilters}) {

    const [isOpen, setIsOpen] = useState(false);
    const hasActiveFilters = genderFilter !== 'all' || addressFilter !== 'all' || (dateFrom !== '' && dateFrom !== undefined) || (dateTo !== '' && dateTo !== undefined);

    const handleApply = () => { setIsOpen(false); };

    const handleCancel = () => {
        onResetFilters();
        setIsOpen(false);
    };

    return (
        <div className="filters-container">
            {hasActiveFilters ? (<button className="clear-filters-button" onClick={onResetFilters} title="Очистити всі фільтри"><img src={cleanIcon} alt="" width="40" height="40" /></button>
            ) : (
                <button className="filters-toggle-button" onClick={() => setIsOpen(true)} title="Показати фільтри"><img src={filterIcon} alt="" width="40" height="40" /></button>
            )}
            {isOpen && (
                <>
                    <div className="filters-overlay" onClick={() => setIsOpen(false)}/>
                    <div className="filters-panel">
                        <div className="filters-content">
                            <div className="filter-header">
                                <h3>Фільтр</h3>
                            </div>
                            <div className="filter-group">
                                <label htmlFor="genderFilter">По cтаті</label>
                                <select id="genderFilter" value={genderFilter} onChange={(e) => onGenderFilterChange(e.target.value)}><option value="all">Усі</option><option value="Ч">Чоловіча (Ч)</option><option value="Ж">Жіноча (Ж)</option></select>
                            </div>
                            <div className="filter-group">
                                <label htmlFor="addressFilter">По населеному пункті</label>
                                <select id="addressFilter" value={addressFilter} onChange={(e) => onAddressFilterChange(e.target.value)}>
                                    {ADDRESS_FILTER_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
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
