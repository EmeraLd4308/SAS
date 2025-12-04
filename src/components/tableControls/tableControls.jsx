import { useState, useRef, useEffect } from 'react'
import { FiltersButton } from '../filter/filter'
import searchIcon from '../../assets/icons/search.svg'
import clearIcon from '../../assets/icons/clear.svg'
import './tableControls.scss'

export function TableControls({searchTerm, onSearchChange, genderFilter, onGenderFilterChange, dateFrom, onDateFromChange, dateTo, onDateToChange, onResetFilters, onAddClick}) {

    const searchInputRef = useRef(null);
    const [inputValue, setInputValue] = useState(searchTerm || '');
    const [hasSearched, setHasSearched] = useState(false);
    const shouldShowClearButton = hasSearched && inputValue !== '' && inputValue === searchTerm;

    useEffect(() => {
        setInputValue(searchTerm || '');
    }, [searchTerm]);

    const handleSearchClick = () => {
        if (searchInputRef.current) {
            const value = searchInputRef.current.value;
            onSearchChange(value);
            setHasSearched(true);
        }
    };

    const handleClearSearch = () => {
        const input = searchInputRef.current;
        if (input) {
            input.value = '';
            setInputValue('');
            onSearchChange('');
            setHasSearched(false);
            input.focus();
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (hasSearched && value !== searchTerm) {
            setHasSearched(false);
        }
        if (value === '' && searchTerm !== '') {
            onSearchChange('');
            setHasSearched(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };
    
    return (
        <div className="table-controls">
            <div className="search-and-filters">
                <div className="control-group search-control">
                    <div className="search-wrapper">
                        <button className="add-button" onClick={onAddClick} title="Додати запис" aria-label="Додати дитину">+</button>
                        <input ref={searchInputRef} type="text" id="search" placeholder="Пошук (ПІБ, Адреса)" value={inputValue} onChange={handleInputChange} onKeyPress={handleKeyPress}/>
                        {shouldShowClearButton ? (
                            <button className="clear-button" title="Очистити пошук" aria-label="Очистити пошук" onClick={handleClearSearch}><img src={clearIcon} alt="Очистити" /></button>
                        ) : (
                            <button className="search-button" title="Пошук" aria-label="Пошук" onClick={handleSearchClick}><img src={searchIcon} alt="Пошук" /></button>
                        )}
                        <FiltersButton
                            genderFilter={genderFilter}
                            onGenderFilterChange={onGenderFilterChange}
                            dateFrom={dateFrom}
                            onDateFromChange={onDateFromChange}
                            dateTo={dateTo}
                            onDateToChange={onDateToChange}
                            onResetFilters={onResetFilters}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
