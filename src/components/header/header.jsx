import { useState, useEffect } from 'react'
import { getUniqueYears } from '../../services/childsService'
import './header.scss'

export function Header({ onYearFilter, activeYear, onResetActiveYear }) {
    
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const logoUrl = '/logo.svg';
    useEffect(() => { loadYears(); }, []);

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
    const handleHeaderClick = (e) => { if (!e.target.closest('.nav-btn') && activeYear !== null) { onResetActiveYear(); } };

    return (
        <header className="app-header" onClick={handleHeaderClick}>
            <div className="header-content">
                <div className="logo">
                    <div className="logo-image">
                        <img src={logoUrl} alt="Логотип" />
                    </div>
                </div>
                <nav className="navigation">
                    {loading ? (<div className="loading-years">Завантаження років...</div>) : (years.map(year => (<button key={year} className={`nav-btn ${activeYear === year ? 'active' : ''}`} onClick={() => handleYearClick(year)} title={`Фільтрувати за ${year} роком народження`}>{year}</button>)))}
                </nav>
            </div>
        </header>
    );
}
