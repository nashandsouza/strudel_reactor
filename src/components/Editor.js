export function Editor({ song, setSong }) {
    return (
    <div className="card h-100">
    <div className="card-body">
    <h5 className="card-title mb-2">Preprocessor Editor</h5>
    <textarea className="form-control code" spellCheck={false} value={song} onChange={(e)=>setSong(e.target.value)} />
    </div>
    </div>
    );
    }