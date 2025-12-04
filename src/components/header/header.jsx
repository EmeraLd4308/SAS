import { useState, useEffect } from 'react';
import { getUniqueYears } from '../../services/studentsService';
import './header.scss'

export function Header({ onYearFilter }) {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(null);
    const logoUrl = '/logo.svg';

    // Завантаження років при монтуванні
    useEffect(() => {
        loadYears();
    }, []);

    // Функція завантаження унікальних років
    const loadYears = async () => {
        try {
            setLoading(true);
            const uniqueYears = await getUniqueYears();
            setYears(uniqueYears);
        } catch (error) {
            console.error('Помилка завантаження років:', error);
            // Запасний варіант - показуємо останні 5 років
            const currentYear = new Date().getFullYear();
            const defaultYears = Array.from({ length: 6 }, (_, i) => currentYear - i);
            setYears(defaultYears);
        } finally {
            setLoading(false);
        }
    };

    // Обробка кліку на рік
    const handleYearClick = (year) => {
        const newSelectedYear = selectedYear === year ? null : year;
        setSelectedYear(newSelectedYear);

        // Викликаємо функцію фільтрації
        if (onYearFilter) {
            onYearFilter(newSelectedYear);
        }
    };

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="logo">
                    <div className="logo-image">
                        <img src={logoUrl} alt="Логотип" />
                    </div>
                </div>

                <nav className="navigation">
                    {loading ? (
                        <div className="loading-years">Завантаження років...</div>
                    ) : (
                        years.map(year => (
                            <button
                                key={year}
                                className={`nav-btn ${selectedYear === year ? 'active' : ''}`}
                                onClick={() => handleYearClick(year)}
                                title={`Фільтрувати за ${year} роком народження`}
                            >
                                {year}
                            </button>
                        ))
                    )}
                </nav>
            </div>
        </header>
    );
}