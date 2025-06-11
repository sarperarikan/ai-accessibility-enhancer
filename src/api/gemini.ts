// WCAG AI Analiz API'si
import {
  ElementStructure,
  SemanticAnalysis,
  analyzeElementStructure,
  analyzeSemanticStructure,
} from './wcag-helpers';

export interface WCAGAnalysisRequest {
  type: 'element' | 'page' | 'url';
  content: {
    element?: HTMLElement; // Element analizi için
    html?: string; // Sayfa analizi için
    url?: string; // URL analizi için
  };
}

// Gemini API çağrısı
async function callGeminiAPI(prompt: string, model: string = 'gemini-1.5-flash'): Promise<string> {
  const GEMINI_API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  
  // Chrome extension'da API anahtarını window'dan al
  const GEMINI_API_KEY = (window as any).GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API anahtarı yapılandırılmamış. Lütfen extension ayarlarından API anahtarınızı girin.');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 1,
        maxOutputTokens: 2048, // Artırıldı
        candidateCount: 1,
        stopSequences: [],
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API hatası: ${response.status}`);
  }

  const data = await response.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text || 'AI yanıtı alınamadı.'
  );
}

/**
 * Gemini API'sinden güncel model listesini çeker
 */
export async function getAvailableModels(apiKey?: string): Promise<GeminiModel[]> {
  const GEMINI_API_KEY = apiKey || (window as any).GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('API anahtarı gerekli');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error(`Model listesi alınamadı: ${response.status}`);
    }

    const data = await response.json();
    
    // Sadece generateContent destekleyen modelleri filtrele
    const models = data.models
      ?.filter((model: any) =>
        model.supportedGenerationMethods?.includes('generateContent') &&
        model.name.includes('gemini')
      )
      ?.map((model: any) => ({
        id: model.name.replace('models/', ''),
        name: model.displayName || model.name.replace('models/', ''),
        description: model.description || `${model.name.replace('models/', '')} model`
      })) || [];

    return models;
  } catch (error) {
    console.error('Model listesi çekme hatası:', error);
    // Fallback: Default modeller
    return [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Hızlı ve verimli model' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Gelişmiş yetenekler' },
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Standart model' }
    ];
  }
}

export interface GeminiModel {
  id: string;
  name: string;
  description?: string;
}

/**
 * Element analizi için gelişmiş WCAG 2.2-AA uyumlu prompt oluşturur
 * Her analiz WCAG Success Criteria referanslarıyla desteklenir
 */
function createElementAnalysisPrompt(
  structure: ElementStructure,
  semantics: SemanticAnalysis
): string {
  return `Sen 20 yıllık deneyime sahip bir dijital erişilebilirlik uzmanısın. WCAG 2.2-AA standartları ve ARIA teknikleri ışığında bu HTML elementini kapsamlı analiz et.

🎯 ANALİZ EDİLECEK ELEMENT:
Etiket: <${structure.tagName}>
Rol: ${structure.role || semantics.semanticRole || 'varsayılan'}
Metin İçeriği: "${structure.textContent || 'boş'}"
ARIA Özellikleri: ${Object.keys(structure.ariaAttributes).length > 0 ? JSON.stringify(structure.ariaAttributes, null, 2) : 'yok'}
Etkileşimli: ${structure.isInteractive ? 'evet' : 'hayır'}
Klavye Erişimi: ${semantics.keyboardAccessible ? 'evet' : 'hayır'}

📋 DETAYLI WCAG 2.2-AA ANALİZİ:

## 1. 🚫 TESPİT EDİLEN SORUNLAR
Her sorun için hangi WCAG Success Criteria ihlal edildiğini belirt:

**Perceivable (Algılanabilir):**
- 1.1.1 Non-text Content - Alt metin kontrolü
- 1.3.1 Info and Relationships - Programmatik ilişkiler
- 1.4.3 Contrast (Minimum) - Renk kontrastı
- 1.4.11 Non-text Contrast - UI bileşeni kontrastı

**Operable (Kullanılabilir):**
- 2.1.1 Keyboard - Klavye erişilebilirliği
- 2.1.2 No Keyboard Trap - Klavye tuzağı
- 2.4.3 Focus Order - Odak sırası
- 2.4.7 Focus Visible - Görünür odak

**Understandable (Anlaşılabilir):**
- 3.2.2 On Input - Girdi değişiminde tutarlılık
- 3.3.2 Labels or Instructions - Etiket/talimatlar

**Robust (Sağlam):**
- 4.1.2 Name, Role, Value - Ad, rol, değer
- 4.1.3 Status Messages - Durum mesajları

## 2. ✅ İYİLEŞTİRİLMİŞ KOD ÖNERİSİ
\`\`\`html
<!-- Orijinal kod problematik -->
${generateOriginalElementCode(structure)}

<!-- İyileştirilmiş WCAG 2.2-AA uyumlu kod -->
${generateImprovedElementCode(structure, semantics)}
\`\`\`

## 3. 🔧 UYGULAMA DETAYLARI

**ARIA Teknikleri:**
- Hangi ARIA roller/özellikler eklenmeli
- aria-labelledby vs aria-describedby kullanımı
- Live regions (aria-live) gerekliliği

**Klavye Navigasyonu:**
- tabindex değerleri (-1, 0, pozitif)
- Arrow key, Enter, Space davranışları
- Focus management stratejileri

**Ekran Okuyucu Desteği:**
- Semantic HTML önceliği
- Screen reader test önerileri
- Announcements timing

## 4. 🎯 PRİORİTE SIRASI
1. **Kritik:** Temel erişilebilirlik (A seviyesi)
2. **Yüksek:** WCAG 2.2-AA uyumluluk
3. **Orta:** Kullanıcı deneyimi geliştirmeleri
4. **Düşük:** İleri düzey optimizasyonlar

Her öneri için kod örnekleri ve hangi WCAG kriterini karşıladığını açıkla.`;
}

/**
 * Orijinal element kodunu yeniden oluştur (hata tespiti için)
 */
function generateOriginalElementCode(structure: ElementStructure): string {
  const attrs = [];
  if (structure.id) attrs.push(`id="${structure.id}"`);
  if (structure.className) attrs.push(`class="${structure.className}"`);
  if (structure.role) attrs.push(`role="${structure.role}"`);

  Object.entries(structure.ariaAttributes).forEach(([key, value]) => {
    attrs.push(`${key}="${value}"`);
  });

  const attrString = attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  return `<${structure.tagName}${attrString}>${structure.textContent || ''}</${structure.tagName}>`;
}

/**
 * İyileştirilmiş element kodu öner
 */
function generateImprovedElementCode(
  _structure: ElementStructure,
  _semantics: SemanticAnalysis
): string {
  // Bu fonksiyon AI tarafından dinamik olarak oluşturulacak
  return `<!-- AI tarafından dinamik olarak oluşturulacak -->`;
}

// Element düzeyinde analiz
export async function analyzeElement(element: HTMLElement, aiProvider: string = 'gemini', model: string = 'gemini-1.5-flash'): Promise<string> {
  try {
    // 1. Element yapısını analiz et
    const structure = analyzeElementStructure(element);

    // 2. Semantik analiz yap
    const semantics = analyzeSemanticStructure(element);

    // 3. AI prompt'unu oluştur
    const prompt = createElementAnalysisPrompt(structure, semantics);

    // 4. AI'dan öneri al - provider'a göre yönlendir
    if (aiProvider === 'gemini') {
      return await callGeminiAPI(prompt, model);
    } else if (aiProvider === 'ollama') {
      // Ollama API çağrısı buraya eklenecek
      throw new Error('Ollama desteği henüz eklenmedi');
    } else {
      throw new Error('Desteklenmeyen AI sağlayıcısı');
    }
  } catch (error: any) {
    console.error('Element analiz hatası:', error);
    throw error;
  }
}

// Tam sayfa analizi
export async function analyzePage(html: string, aiProvider: string = 'gemini', model: string = 'gemini-1.5-flash'): Promise<string> {
  const prompt = `Sen bir WCAG uzmanısın. Bu sayfanın HTML kodunu analiz edip erişilebilirlik raporu hazırlayacaksın:

${html.slice(0, 5000)}  // İlk 5000 karakter

Şu başlıklarda raporla:

1. SAYFA YAPISI
- Başlık hiyerarşisi
- Landmark bölgeleri
- Navigasyon yapısı

2. ERİŞİLEBİLİRLİK SORUNLARI
- Kritik WCAG ihlalleri
- Yapısal eksiklikler
- Semantik hatalar

3. İYİLEŞTİRME ÖNERİLERİ
- Öncelikli düzeltmeler
- Kod örnekleri
- Best practices

Kısa ve öz bir rapor hazırla.`;

  if (aiProvider === 'gemini') {
    return await callGeminiAPI(prompt, model);
  } else if (aiProvider === 'ollama') {
    // Ollama API çağrısı buraya eklenecek
    throw new Error('Ollama desteği henüz eklenmedi');
  } else {
    throw new Error('Desteklenmeyen AI sağlayıcısı');
  }
}

// URL analizi
export async function analyzeUrl(url: string, aiProvider: string = 'gemini', model: string = 'gemini-1.5-flash'): Promise<string> {
  const prompt = `Sen bir WCAG uzmanısın. Bu URL'deki sayfayı erişilebilirlik açısından analiz edeceksin:

URL: ${url}

Şu konulara odaklan:

1. SEO & ERİŞİLEBİLİRLİK
- Sayfa başlığı ve meta açıklamalar
- Başlık hiyerarşisi
- Alt metinler

2. KULLANICI DENEYİMİ
- Klavye navigasyonu
- Ekran okuyucu uyumluluğu
- Mobil erişilebilirlik

3. WCAG UYUMLULUĞU
- AA seviyesi ihlalleri
- Otomatik testler
- Manuel kontrol gereken alanlar

Pratik öneriler ve kod örnekleriyle destekle.`;

  if (aiProvider === 'gemini') {
    return await callGeminiAPI(prompt, model);
  } else if (aiProvider === 'ollama') {
    // Ollama API çağrısı buraya eklenecek
    throw new Error('Ollama desteği henüz eklenmedi');
  } else {
    throw new Error('Desteklenmeyen AI sağlayıcısı');
  }
}
