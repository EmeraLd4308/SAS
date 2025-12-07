import { useState } from 'react'
import '../../services/authService'
import './signIn.scss'

export function SignIn({ onLogin }) {
    
    const [accessKey, setAccessKey] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(accessKey); 
    };
    const handleKeyPress = (e) => { if (e.key === 'Enter') { handleSubmit(e); } };

    return (
        <>
            <div className="form-overlay"/>
            <div className="signin-card">
                <h2>Вхід</h2>
                <form onSubmit={handleSubmit} className="form-vertical">
                    <div className="login-field">
                        <input id="accessKey" type="password" name="accessKey" placeholder="Введіть ключ доступу" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} onKeyPress={handleKeyPress} autoFocus/>
                    </div>
                    <div className="button-row">
                        <button type="submit" className="save-button">Увійти</button>
                    </div>
                </form>
            </div>
        </>
    );
}
