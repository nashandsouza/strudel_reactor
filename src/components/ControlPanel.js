export default function ControlPanel({ ui, setUi }) {
    return (
    <div className="card h-100">
    <div className="card-body">
    <h5 className="card-title">Preprocessor Controls</h5>
    <p className="text-secondary small">Hush radios work without tags; tempo updates live while playing.</p>
    <div className="mb-3">
    <h6 className="mb-2">Instruments (Hush)</h6>
    {['p1','p2'].map(k => (
    <div className="mb-2" key={k}>
    <label className="form-label text-uppercase mb-1">{k}</label>
    <div className="btn-group w-100" role="group">
    <input type="radio" className="btn-check" name={`r-${k}`} id={`${k}-on`} checked={ui.instruments[k]==='on'} onChange={()=>setUi(s=>({...s, instruments:{...s.instruments,[k]:'on'}}))}/>
    <label className={`btn ${ui.instruments[k]==='on'?'btn-primary':'btn-outline-primary'}`} htmlFor={`${k}-on`}>On</label>
    <input type="radio" className="btn-check" name={`r-${k}`} id={`${k}-hush`} checked={ui.instruments[k]==='hush'} onChange={()=>setUi(s=>({...s, instruments:{...s.instruments,[k]:'hush'}}))}/>
    <label className={`btn ${ui.instruments[k]==='hush'?'btn-primary':'btn-outline-primary'}`} htmlFor={`${k}-hush`}>Hush</label>
    </div>
    <div className="form-text">Maps {k} → d{ k === 'p1' ? '1' : '2' } (replaces line with <code>silence</code> when Hush)</div>
    </div>
    ))}
    </div>
    </div>
    </div>
    );
    }