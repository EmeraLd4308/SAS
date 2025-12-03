import './deleteWindow.scss'

export function DeleteWindow({ message, onConfirm, onCancel }) {
    if (!message) return null;
    const isConfirm = typeof onConfirm === 'function';
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <p>{message}</p>
                <div className="modal-actions">
                    {isConfirm ? (<>
                        <button className="btn-confirm" onClick={onConfirm}>Видалити</button>
                    <button className="btn-cancel" onClick={onCancel}>Скасувати</button>
                    </>) : (<button className="btn-ok" onClick={onCancel}>OK</button>)}
                </div>
            </div>
        </div>
    );
}
