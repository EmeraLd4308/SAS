import { useDebounce } from '../../hooks/useDebounce';
import { FiltersButton } from '../filter/filter';
import './tableControls.scss';

export function TableControls({
                                  searchTerm,
                                  onSearchChange,
                                  genderFilter,
                                  onGenderFilterChange,
                                  dateFrom,
                                  onDateFromChange,
                                  dateTo,
                                  onDateToChange,
                                  onResetFilters // Тільки це
                              }) {
    const debouncedSearch = useDebounce(onSearchChange, 500);

    const handleSearchChange = (e) => {
        debouncedSearch(e.target.value);
    };

    const searchSuggestions = [
        'Іван',
        'Марія',
        'Київ',
        'Львів'
    ].filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 3);

    return (
        <div className="table-controls">
            <div className="search-and-filters">
                <div className="control-group search-control">
                    <label htmlFor="search">Пошук (ПІБ, Адреса)</label>
                    <div className="search-wrapper">
                        <input
                            type="text"
                            id="search"
                            placeholder="Введіть пошуковий запит..."
                            defaultValue={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && searchSuggestions.length > 0 && (
                            <div className="search-suggestions">
                                {searchSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => {
                                            onSearchChange(suggestion);
                                            document.getElementById('search').value = suggestion;
                                        }}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
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