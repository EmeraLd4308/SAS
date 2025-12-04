import { useState, useEffect } from 'react'
import { getUniqueYears } from '../../services/studentsService'
import './footer.scss'

export function Footer({ onYearFilter, activeYear, onResetActiveYear }) {
    
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadYears();
    }, []);

    const loadYears = async () => {
        try {
            setLoading(true);
            const uniqueYears = await getUniqueYears();
            setYears(uniqueYears);
        } catch (error) {
            console.error('Помилка завантаження років:', error);
            const currentYear = new Date().getFullYear();
            const defaultYears = Array.from({ length: 6 }, (_, i) => currentYear - i);
            setYears(defaultYears);
        } finally {
            setLoading(false);
        }
    };

    const handleYearClick = (year) => {
        if (activeYear === year) {
            onYearFilter(null);
        } else {
            onYearFilter(year);
        }
    };

    return (
        <footer className="app-footer">
            <div className="footer-content">
                
                <div className="footer-section">
                    <nav className="navigation">
                        {loading ? (<div className="loading-years">Завантаження років...</div>
                        ) : (
                            years.map(year => (
                                <button key={year} className={`nav-btn ${activeYear === year ? 'active' : ''}`} onClick={() => handleYearClick(year)} title={`Фільтрувати за ${year} роком народження`}>{year}</button>
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
