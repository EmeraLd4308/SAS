import './header.scss';

export function Header() {
    const logoUrl = '/LOGO2.svg';
    return (
        <header className="app-header">
            <div className="header-content">
                <div className="logo">
                    <div className="logo-image">
                        <img src={logoUrl} alt="Логотип" />
                    </div>
                </div>
                <nav className="navigation">
                    <button className="nav-btn">2025</button>
                    <button className="nav-btn">2024</button>
                    <button className="nav-btn">2023</button>
                    <button className="nav-btn">2022</button>
                    <button className="nav-btn">2021</button>
                </nav>
            </div>
        </header>
    );
}
