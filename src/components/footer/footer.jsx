import './footer.scss';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>ВОКС Система</h3>
                    <p>Система управління учнями шкільного та дошкільного віку</p>
                </div>

                <div className="footer-section">
                    <h4>Контакти</h4>
                    <p>Email: info@voks.edu.ua</p>
                    <p>Телефон: +380 (XX) XXX-XXXX</p>
                </div>

                <div className="footer-section">
                    <h4>Підтримка</h4>
                    <p>Довідка</p>
                    <p>Інструкції</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {currentYear} ВОКС. Всі права захищені.</p>
            </div>
        </footer>
    );
}