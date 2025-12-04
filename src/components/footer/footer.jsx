import { useState, useEffect } from 'react'
import { getUniqueYears } from '../../services/studentsService'
import './footer.scss'

export function Footer({ onYearFilter }) {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(null);

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
            // Запасний варіант - показуємо останні 6 років
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
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-section">
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
                <div className="footer-section">
                    <p>© Відділ освіти, культури, молоді, спорту Берегометської селищної ради</p>
                </div>
            </div>
        </footer>
    );
}