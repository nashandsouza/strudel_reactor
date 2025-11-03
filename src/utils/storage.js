const KEY = 'strudel-reactor-state-v1';
export const saveState = (state) => {
try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
};
export const loadState = (fallback) => {
try {
const raw = localStorage.getItem(KEY);
return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
} catch { return fallback; }
};

export function downloadJSON(obj, filename = 'data.json') {
    try {
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {}
  }
  
  export function readJSONFile(file) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            resolve(data);
          } catch (e) { reject(e); }
        };
        reader.onerror = reject;
        reader.readAsText(file);
      } catch (e) { reject(e); }
    });
  }
  