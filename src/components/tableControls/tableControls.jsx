import { useDebounce } from '../../hooks/useDebounce';
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
    sortBy,
    onSortByChange,
    sortOrder,
    onSortOrderChange,
    itemsPerPage,
    onItemsPerPageChange
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

            <div className="control-group">
                <label htmlFor="genderFilter">Фільтр по Статі</label>
                <select id="genderFilter" value={genderFilter} onChange={(e) => onGenderFilterChange(e.target.value)}>
                    <option value="all">Усі</option>
                    <option value="Ч">Чоловіча (Ч)</option>
                    <option value="Ж">Жіноча (Ж)</option>
                </select>
            </div>

            <div className="control-group date-control">
                <label htmlFor="dateFrom">Народження від</label>
                <input
                    type="date"
                    id="dateFrom"
                    value={dateFrom}
                    onChange={(e) => onDateFromChange(e.target.value)}
                />
            </div>

            <div className="control-group date-control">
                <label htmlFor="dateTo">Народження до</label>
                <input
                    type="date"
                    id="dateTo"
                    value={dateTo}
                    onChange={(e) => onDateToChange(e.target.value)}
                />
            </div>

            <div className="control-group">
                <label htmlFor="sortBy">Сортувати за полем</label>
                <select id="sortBy" value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
                    <option value="id">ID</option>
                    <option value="child_name">ПІБ Дитини</option>
                    <option value="birth_date">Датою народження</option>
                    <option value="parent_name">ПІБ Батьків</option>
                </select>
            </div>

            <div className="control-group">
                <label htmlFor="sortOrder">Напрямок</label>
                <select id="sortOrder" value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)}>
                    <option value="asc">Зростання (A-Я/1-9)</option>
                    <option value="desc">Спадання (Я-А/9-1)</option>
                </select>
            </div>

            <div className="control-group">
                <label htmlFor="itemsPerPage">Елементів на сторінці</label>
                <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>
    );
}