# 🤖 AI Accessibility Enhancer

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/sarperarikan/ai-accessibility-enhancer)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![WCAG](https://img.shields.io/badge/WCAG-2.2--AA-brightgreen.svg)](https://www.w3.org/WAI/WCAG22/quickref/)

Chrome extension for AI-powered web accessibility analysis with enhanced markdown rendering and HTML code visualization.

## ✨ Yeni Özellikler (v2.1.0)

### 🎨 Gelişmiş UI/UX
- **Markdown Render Engine**: Gelişmiş markdown parser ile kod blokları, başlıklar, listeler
- **HTML Kod Görüntüleyici**: Salt okunur HTML kod gösterimi syntax highlighting ile
- **Yan Yana Görünüm**: AI analizi ve HTML kodu aynı anda görüntüleme
- **Tema Desteği**: Koyu/açık tema uyumlu render sistemi

### 🔍 Analiz Geliştirmeleri
- **Element HTML Saklama**: Analiz edilen elementlerin HTML kodları kaydediliyor
- **CSS Selector Tanımlama**: Element seçicileri otomatik oluşturuluyor
- **WCAG Kriterleri**: İlgili WCAG kriterleri işaretleniyor
- **Detaylı Meta Veriler**: Timestamp, element bilgileri, öneriler

### 🎯 Kullanıcı Deneyimi
- **Kopyalama Fonksiyonları**: Analiz ve HTML kod kopyalama
- **Expand/Collapse**: Uzun içerikler için genişletme/daraltma
- **Loading States**: Daha iyi yükleme göstergeleri
- **Hata Yönetimi**: Gelişmiş hata mesajları ve troubleshooting

## 🚨 Analiz Diyaloğu Sorun Giderme

Eğer sağ tıklama menüsünden "Erişilebilirlik Analizi" seçeneği çalışmıyorsa:

### 1. Extension'ı Yeniden Yükleyin
1. Chrome'da `chrome://extensions/` adresine gidin
2. "AI Accessibility Enhancer" extension'ını bulun
3. "Yeniden yükle" (🔄) butonuna tıklayın
4. Sayfayı yenileyin (F5)

### 2. Test Sayfasını Kullanın
1. `test-modal.html` dosyasını tarayıcıda açın
2. "🎯 Direkt Modal Test" butonuna tıklayın
3. Debug bilgilerini kontrol edin

### 3. Manuel Debug
1. F12 ile Developer Tools'u açın
2. Console sekmesine geçin
3. Şu komutu çalıştırın: `window.debugAIExtension()`

### 4. Context Menu Test
1. Test sayfasında herhangi bir elemento sağ tıklayın
2. "Erişilebilirlik Analizi" seçeneğini arayın
3. Console'da hata mesajlarını kontrol edin

### 5. Production Test Sayfaları
- `production-test.html` - Gerçek web sitesi simülasyonu
- `test-modal.html` - Debug ve geliştirici araçları

## 🚀 Hızlı Başlangıç

### 1. Kurulum
```bash
git clone https://github.com/sarperarikan/ai-accessibility-enhancer.git
cd ai-accessibility-enhancer
npm install
npm run build
```

### 2. Chrome'a Yükleme
1. Chrome → `chrome://extensions/`
2. **Developer mode**'u aktifleştir
3. **Load unpacked** → `dist` klasörünü seç
4. Extension aktif hale gelecek

### 3. API Anahtarı Ayarlama
1. Extension popup'ını aç
2. **"Gemini AI Ayarları"** sekmesine git
3. [Google AI Studio](https://makersuite.google.com/app/apikey)'dan API anahtarı al
4. Anahtarı yapıştır ve **kaydet**

## 🎯 Kullanım

### Context Menu ile Analiz
1. **Web sayfasında herhangi bir elemente sağ tıklayın**
2. **"AI ile Denetle → Erişilebilirlik"** seçin
3. **AI analiz modal'ı açılacak**
4. **Analiz sonuçlarını inceleyin**

### Extension Popup
1. **Toolbar'dan extension ikonuna tıklayın**
2. **"Analizler" sekmesinde:**
   - Sol panel: Analiz geçmişi listesi
   - Sağ panel: Seçilen analizin detayları
3. **Görüntüleme modları:**
   - 🧠 **AI Analizi**: Markdown render edilmiş analiz
   - 🏷️ **HTML Kodu**: Syntax highlighted kod görünümü  
   - 👥 **Birlikte**: Her ikisi aynı anda

### Özellikler

#### 📋 Kopyalama
- **Analiz Kopyalama**: AI analiz sonuçlarını panoya kopyala
- **HTML Kod Kopyalama**: Element HTML kodlarını kopyala
- **Temiz Format**: Markdown işaretleri temizlenerek kopyalanır

#### 🎨 Tema Desteği
- **Koyu Tema**: Gece çalışması için optimize edilmiş
- **Açık Tema**: Gündüz kullanımı için klasik tasarım
- **Otomatik Render**: Markdown ve kod renklendirme tema uyumlu

#### 📊 Markdown Render
- **Kod Blokları**: ```language syntax highlighting
- **Başlıklar**: H1, H2, H3, H4 hierarchical styling
- **Listeler**: Bullet ve numbered list support
- **Linkler**: Clickable links with accessibility labels
- **Blockquotes**: Styled quote blocks
- **Inline Code**: `code` highlighting

## 🔧 Geliştirme

### Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Testing
```bash
npm test
npm run test:watch
```

## 📁 Proje Yapısı

```
chrome-axe-gemini/
├── src/
│   ├── popup/
│   │   ├── AnalysisViewer.tsx      # Markdown render viewer
│   │   ├── ElementCodeViewer.tsx   # HTML code viewer
│   │   ├── EnhancedElementsTab.tsx # Enhanced analysis UI
│   │   ├── popup.tsx               # Main popup
│   │   ├── types.ts                # Type definitions
│   │   └── utils.ts                # Utility functions
│   ├── content/
│   │   ├── content.ts              # Content script
│   │   ├── aiAnalyzer.ts           # AI analysis handler
│   │   └── modalUtils.ts           # Modal utilities
│   ├── background/
│   │   ├── messageHandlers.ts      # Message routing
│   │   └── apiHandlers.ts          # API calls
│   └── utils/
│       └── i18n.ts                 # Internationalization
├── demo/
│   └── enhanced-analysis-demo.html # Demo test page
├── dist/                           # Build output
└── docs/                           # Documentation
```

## 🧪 Test Sayfası

Demo sayfasını kullanarak yeni özellikleri test edebilirsiniz:

```bash
# Demo sayfasını aç
open demo/enhanced-analysis-demo.html
```

Demo sayfası şunları içerir:
- ✅ **İyi örnekler**: WCAG uyumlu elementler
- ❌ **Kötü örnekler**: Accessibility sorunlu elementler
- 🎯 **Test elementleri**: Button, form, image, nav, table, alert
- 📝 **Kullanım talimatları**: Step-by-step test rehberi

## 🎨 Yeni Bileşenler

### AnalysisViewer
Gelişmiş markdown render özellikli analiz görüntüleyici:

```typescript
<AnalysisViewer
  analysis={analysisText}
  title="AI Analiz Sonucu"
  showCopyButton={true}
  showAlert={showAlert}
/>
```

### ElementCodeViewer
HTML kod görüntüleme bileşeni:

```typescript
<ElementCodeViewer
  htmlContent={elementHTML}
  elementSelector="#button-id"
  elementType="button"
  showAlert={showAlert}
/>
```

### EnhancedElementsTab
Yan yana görüntüleme ile gelişmiş elements sekmesi:

```typescript
<EnhancedElementsTab
  elementAnalyses={analyses}
  onShowContextMenuInfo={showInfo}
  onClearAnalyses={clearAll}
  showAlert={showAlert}
/>
```

## 🔄 API Değişiklikleri

### ElementAnalysis Interface
```typescript
interface ElementAnalysis {
  elementType: string;
  elementId?: string;
  elementClass?: string;
  analysis: string;
  timestamp: string;
  suggestions: string[];
  htmlContent?: string;      // NEW: Element HTML
  elementSelector?: string;  // NEW: CSS selector
  wcagCriteria?: string[];   // NEW: WCAG criteria
}
```

### Message Types
```typescript
// Background script -> Popup message
{
  type: 'ELEMENT_ANALYSIS_RESULT',
  elementType: string,
  elementId?: string,
  elementClass?: string,
  elementSelector?: string,
  analysis: string,
  htmlContent?: string,
  timestamp: string,
  suggestions: string[],
  wcagCriteria: string[]
}
```

## 🌍 Desteklenen Diller
- 🇹🇷 **Türkçe** (Varsayılan)
- 🇺🇸 **English**

## 📈 Performans

### Optimizasyonlar
- **Lazy Loading**: Büyük içerikler için tembel yükleme
- **Virtual Scrolling**: Uzun analiz listleri için
- **Code Splitting**: Bileşen bazlı kod bölümleme
- **Memoization**: React.memo ile render optimizasyonu

### Sistem Gereksinimleri
- **Chrome**: v100+
- **Memory**: ~50MB RAM usage
- **Storage**: ~5MB local storage

## 🔒 Güvenlik

### Veri Gizliliği
- **Yerel Depolama**: Tüm veriler browser'da saklanır
- **API Güvenliği**: API anahtarları encrypted storage
- **No Tracking**: Hiçbir kullanıcı verisi toplanmaz
- **HTTPS Only**: Tüm API çağrıları güvenli

### İzinler
```json
{
  "permissions": [
    "storage",           // Settings storage
    "activeTab",         // Current tab access
    "contextMenus"       // Right-click menu
  ],
  "host_permissions": [
    "https://generativelanguage.googleapis.com/*"  // Gemini API
  ]
}
```

## 🤝 Katkıda Bulunma

### Development Setup
1. **Fork** the repository
2. **Clone** your fork
3. **Create** feature branch: `git checkout -b feature/amazing-feature`
4. **Commit** changes: `git commit -m 'Add amazing feature'`
5. **Push** to branch: `git push origin feature/amazing-feature`
6. **Open** Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality
- **WCAG 2.2-AA**: Accessibility compliance

## 📝 Changelog

### v2.1.0 (2024-12-09)
#### ✨ Added
- Gelişmiş markdown render engine
- HTML kod görüntüleyici (syntax highlighting)
- Yan yana analiz/kod görünümü
- Tema uyumlu renklendirme
- Element HTML saklama
- CSS selector otomatik oluşturma
- Kopyalama fonksiyonları
- Expand/collapse özelliği

#### 🔧 Improved
- UI/UX tamamen yenilendi
- Performans optimizasyonları
- Hata yönetimi geliştirildi
- TypeScript tip güvenliği artırıldı

#### 🐛 Fixed
- Theme switching bugs
- Markdown rendering issues
- Memory leak fixes
- Cross-browser compatibility

### v2.0.0 (2024-11-15)
- Theme support (dark/light)
- Modular architecture
- Enhanced error handling
- WCAG 2.2-AA compliance

### v1.0.0 (2024-10-01)
- Initial release
- Basic AI analysis
- Context menu integration
- Gemini API support

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👤 Geliştirici

**Sarper ARIKAN**
- 📧 Email: [sarperarikan@gmail.com](mailto:sarperarikan@gmail.com)
- 🐙 GitHub: [@sarperarikan](https://github.com/sarperarikan)
- 💼 LinkedIn: [Sarper Arikan](https://linkedin.com/in/sarperarikan)

## 🙏 Teşekkürler

- **Google AI Studio** - Gemini API desteği için
- **React Team** - UI framework için  
- **TypeScript Team** - Type safety için
- **WCAG Working Group** - Accessibility guidelines için

---

<div align="center">

**🌟 Projeyi beğendiyseniz yıldız vermeyi unutmayın! 🌟**

[⬆ Başa Dön](#-ai-accessibility-enhancer)

</div>
