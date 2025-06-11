# 🎯 Production Test Rehberi - AI Accessibility Enhancer

Bu rehber, Chrome extension'ının production ortamında çalışıp çalışmadığını test etmek için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

### 1. Extension'ı Chrome'a Yükleyin
1. Chrome'da `chrome://extensions/` adresine gidin
2. Sağ üst köşede **"Geliştirici modu"** (Developer mode) seçeneğini açın
3. **"Paketlenmemiş öğe yükle"** (Load unpacked) butonuna tıklayın
4. `chrome-axe-gemini/dist` klasörünü seçin
5. Extension başarıyla yüklendiğinde tarayıcı araç çubuğunda görünecek

### 2. Gerekli Ayarları Yapın
1. Extension ikonuna tıklayın (sağ üst köşe)
2. **"Gemini AI Ayarları"** sekmesine geçin
3. [Google AI Studio](https://makersuite.google.com/app/apikey)'dan API anahtarı alın
4. API anahtarını yapıştırıp **"Kaydet"** butonuna tıklayın

## 🧪 Test Senaryoları

### Test 1: API Key Olmadan Test
1. `production-test.html` dosyasını Chrome'da açın
2. Extension'ın API key'i ayarlanmamışsa
3. Sayfadaki herhangi bir elemento **sağ tıklayın**
4. **"Erişilebilirlik Analizi"** seçeneğini tıklayın
5. **🔑 API Anahtarı Gerekli** modal'ının açıldığını kontrol edin
6. **"⚙️ Extension Ayarları"** butonuna tıklayın
7. Extension popup ipucunun göründüğünü doğrulayın

### Test 2: API Key İle Production Test
1. Extension popup → "Gemini AI Ayarları" → API key girin
2. `production-test.html` dosyasını yenileyin
3. Sayfadaki herhangi bir elemento **sağ tıklayın**
4. **"Erişilebilirlik Analizi"** seçeneğini tıklayın
5. AI analiz modal'ının açılıp analiz başladığını kontrol edin

### Test 3: Gerçek Web Sitesi
1. Herhangi bir web sitesine gidin (örn: `google.com`)
2. Sayfadaki bir elemento **sağ tıklayın**
3. **"Erişilebilirlik Analizi"** seçeneğini tıklayın
4. API key varsa AI analiz modal'ının, yoksa API key uyarısının açıldığını doğrulayın

### Test 4: Debug Test Sayfası
1. `test-modal.html` dosyasını Chrome'da açın
2. **"🎯 Direkt Modal Test"** butonuna tıklayın
3. Debug bilgilerini kontrol edin
4. **"🔍 Extension Debug"** butonuna tıklayın
5. Console'da (F12) debug bilgilerini inceleyin

## 🔍 Sorun Giderme

### Modal Açılmıyorsa:

#### 1. Extension Durumunu Kontrol Edin
```javascript
// Console'da (F12) çalıştırın:
window.debugAIExtension();
```

#### 2. Extension'ı Yeniden Yükleyin
1. `chrome://extensions/` adresine gidin
2. **"AI Accessibility Enhancer"** extension'ını bulun
3. 🔄 **"Yeniden yükle"** (Reload) butonuna tıklayın
4. Test sayfasını yenileyin (F5)

#### 3. Konsol Hatalarını Kontrol Edin
1. F12 ile Geliştirici Araçları'nı (Developer Tools) açın
2. **Konsol** (Console) sekmesine geçin
3. Kırmızı hata mesajlarını arayın
4. Hataları not alın

#### 4. Ağ İsteklerini Kontrol Edin
1. Geliştirici Araçları'nda **Ağ** (Network) sekmesine geçin
2. Sağ tıklayıp analiz başlattığınızda
3. `generativelanguage.googleapis.com` adresine istek gittiğini kontrol edin

### Context Menu Görünmüyorsa:

#### 1. Extension Permissions Kontrol
#### 1. Extension İzinlerini Kontrol Edin
1. `chrome://extensions/` → **"AI Accessibility Enhancer"**
2. **"Ayrıntılar"** (Details) butonuna tıklayın
3. **"Site erişimi"** (Site access) bölümünde **"Tüm sitelerde"** (On all sites) seçili olmalı
#### 2. İçerik Betiği Yüklenmesini Kontrol Edin
```javascript
// Tarayıcı konsolunda (F12) çalıştırın:
console.log('Content script loaded:', !!window.showWCAGModal);
```

## ✅ Başarı Kriterleri

### ✔️ Extension Çalışıyor Demektir:
- [x] Context menu'da **"Erişilebilirlik Analizi"** seçeneği görünüyor
- [x] API key yokken **🔑 API Anahtarı Gerekli** modal'ı açılıyor
- [x] API key uyarı modal'ında Google AI Studio linki çalışıyor
- [x] **"⚙️ Extension Ayarları"** butonu extension popup ipucu gösteriyor
- [x] API key varken **"🤖 AI Erişilebilirlik Analizi"** modal'ı açılıyor
- [x] Element bilgileri (HTML tag, ID, class) gösteriliyor
- [x] AI analizi **"Loading..."** göstergesi çalışıyor
- [x] AI'dan gelen analiz sonucu görüntüleniyor
- [x] **"📋 Analizi Kopyala"** butonu çalışıyor
- [x] Modal **ESC** tuşu ile kapanıyor

### ⚠️ Sorun Olabilir:
- [ ] Context menu'da seçenek yok
- [ ] API key uyarı modal'ı açılmıyor
- [ ] Extension popup ipucu gösterilmiyor
- [ ] Modal açılıyor ama AI analizi başlamıyor
- [ ] "AI analizi başarısız" hatası alıyorum

## 🚨 Kritik Test Noktaları

### 1. API Bağlantısı Test
```javascript
// Console'da test edin:
chrome.runtime.sendMessage({
  type: 'ANALYZE_ELEMENT',
  elementHTML: '<button>Test</button>',
  forceProvider: 'gemini'
}, (response) => {
  console.log('API Test:', response);
});
```

### 2. Content Script Test
```javascript
// Console'da test edin:
if (window.showWCAGModal) {
  window.showWCAGModal(document.body, 'gemini');
  console.log('✅ Modal function works');
} else {
  console.log('❌ Modal function not found');
}
```

### 3. Çok Elemanlı Test
1. Table, form, image, button elementlerini test edin
2. Her birine sağ tıklayıp analiz başlatın
3. Farklı element tiplerinde AI'ın farklı öneriler verdiğini kontrol edin

## 📊 Rapor Şablonu

Test tamamlandığında aşağıdaki bilgileri paylaşın:

```
🎯 AI Accessibility Enhancer Test Raporu

Extension Versiyonu: 2.1.1
Test Tarihi: [TARIH]
Tarayıcı: Chrome [VERSIYON]
Test Sayfası: [SAYFA ADI]

✅ Çalışan Özellikler:
- [ ] Context menu görünüyor
- [ ] Modal açılıyor  
- [ ] Element bilgileri gösteriliyor
- [ ] AI analizi çalışıyor
- [ ] Kopyalama fonksiyonu çalışıyor

❌ Sorunlu Alanlar:
- [ ] [SORUN AÇIKLAMASI]

📋 Console Hataları:
[HATA MESAJLARI]

💡 Öneriler:
[İYİLEŞTİRME ÖNERİLERİ]
```

---

**Not:** Extension tamamen client-side çalışır ve kullanıcı verilerini saklamaz. Sadece analiz edilecek HTML elementi ve AI sağlayıcısı API'sine gönderir.