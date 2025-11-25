import './header.scss';

export function Header() {
    return (
        <header className="app-header">
            <div className="header-content">
                <div className="logo">
                    <h1>ВОКС</h1>
                    <span>Відділ освіти, культури та спорту</span>
                </div>
                <nav className="navigation">
                    <button className="nav-btn active">Учні</button>
                    <button className="nav-btn">Звіти</button>
                    <button className="nav-btn">Налаштування</button>
                </nav>
                <div className="user-info">
                    <span className="user-name">Адміністратор</span>
                    <div className="user-avatar">А</div>
                </div>
            </div>
        </header>
    );
}