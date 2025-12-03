import { useDebounce } from '../../hooks/useDebounce';
import { FiltersButton } from '../filter/filter';
import './tableControls.scss';

export function TableControls({searchTerm, onSearchChange, genderFilter, onGenderFilterChange, dateFrom, onDateFromChange, dateTo, onDateToChange, onResetFilters}) {
    
    const debouncedSearch = useDebounce(onSearchChange, 500);
    const handleSearchChange = (e) => {
        debouncedSearch(e.target.value);
    };
    
    return (
        <div className="table-controls">
            <div className="search-and-filters">
                
                <div className="control-group search-control">
                    <div className="search-wrapper">
                        <input type="text" id="search" placeholder="Пошук (ПІБ, Адреса)" defaultValue={searchTerm} onChange={handleSearchChange}/>
                    </div>
                </div>

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
    );
}