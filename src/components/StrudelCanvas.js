export default function StrudelCanvas({ canvasRef }){
    return (
    <div className="mt-3"><canvas id="roll" ref={canvasRef}></canvas></div>
    );
    }