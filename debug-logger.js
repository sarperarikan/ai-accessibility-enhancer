// Debug Logger - Console loglarını dosyaya yazan sistem
// Bu dosya test-context-menu.html ile birlikte kullanılır

class DebugLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000;
        this.initializeLogging();
    }

    initializeLogging() {
        // Orijinal console metodlarını sakla
        this.originalLog = console.log;
        this.originalError = console.error;
        this.originalWarn = console.warn;

        // Console metodlarını override et
        console.log = (...args) => {
            this.addLog('LOG', args);
            this.originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.addLog('ERROR', args);
            this.originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.addLog('WARN', args);
            this.originalWarn.apply(console, args);
        };

        console.log('🎯 Debug Logger başlatıldı - Loglar otomatik kaydedilecek');
    }

    addLog(level, args) {
        const timestamp = new Date().toISOString();
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        const logEntry = {
            timestamp,
            level,
            message
        };

        this.logs.push(logEntry);

        // Maksimum log sayısını aş
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Her log'da otomatik kaydet
        this.autoSave();
    }

    autoSave() {
        // LocalStorage'a kaydet
        try {
            localStorage.setItem('debugLogs', JSON.stringify(this.logs));
        } catch (e) {
            // LocalStorage dolu olabilir, eski logları sil
            this.logs = this.logs.slice(-500);
            localStorage.setItem('debugLogs', JSON.stringify(this.logs));
        }
    }

    downloadLogs() {
        const logText = this.logs.map(log => 
            `[${log.timestamp}] [${log.level}] ${log.message}`
        ).join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        console.log('✅ Debug logları indirildi');
    }

    clearLogs() {
        this.logs = [];
        localStorage.removeItem('debugLogs');
        console.log('🗑️ Debug logları temizlendi');
    }

    restoreFromStorage() {
        try {
            const saved = localStorage.getItem('debugLogs');
            if (saved) {
                this.logs = JSON.parse(saved);
                console.log(`📂 ${this.logs.length} adet kayıtlı log bulundu`);
            }
        } catch (e) {
            console.error('❌ Loglar yüklenemedi:', e);
        }
    }
}

// Global debug logger instance
window.debugLogger = new DebugLogger();
window.debugLogger.restoreFromStorage();

// Global fonksiyonlar
window.downloadDebugLogs = () => window.debugLogger.downloadLogs();
window.clearDebugLogs = () => window.debugLogger.clearLogs();