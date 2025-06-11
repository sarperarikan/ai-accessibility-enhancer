// API Handlers - Gemini API integration
// MIT License

/**
 * Google Gemini API'sinden mevcut modelleri dinamik olarak çek
 */
export async function fetchGeminiModels(apiKey?: string): Promise<Array<{id: string, name: string}>> {
  // API key varsa dinamik çekmeyi dene
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Available Gemini models:', data);
        
        // Sadece generateContent destekleyen modelleri filtrele (1.5 ve 2.x)
        const availableModels = data.models
          ?.filter((model: any) =>
            model.supportedGenerationMethods?.includes('generateContent') &&
            (model.name.includes('gemini') || model.name.includes('models/gemini'))
          )
          ?.map((model: any) => {
            const modelId = model.name.replace('models/', '');
            let displayName = modelId;
            
            // Model isimlerini güzelleştir
            if (modelId.includes('1.5-flash')) {
              displayName = '⚡ Gemini 1.5 Flash';
            } else if (modelId.includes('1.5-pro')) {
              displayName = '🏆 Gemini 1.5 Pro';
            } else if (modelId.includes('2.0-flash')) {
              displayName = '⚡ Gemini 2.0 Flash';
            } else if (modelId.includes('2.5-flash')) {
              displayName = '⚡ Gemini 2.5 Flash';
            } else if (modelId.includes('2.0-pro')) {
              displayName = '🏆 Gemini 2.0 Pro';
            } else if (modelId.includes('2.5-pro')) {
              displayName = '🏆 Gemini 2.5 Pro';
            } else if (modelId.includes('thinking')) {
              displayName = '🧠 ' + modelId.replace('gemini-', 'Gemini ').replace('-', ' ');
            } else if (modelId.startsWith('gemini-')) {
              displayName = '🤖 ' + modelId.replace('gemini-', 'Gemini ').replace('-', ' ');
            } else {
              displayName = '🔮 ' + modelId.charAt(0).toUpperCase() + modelId.slice(1);
            }
            
            return {
              id: modelId,
              name: displayName
            };
          }) || [];

        if (availableModels.length > 0) {
          console.log('Filtered models:', availableModels);
          return availableModels;
        }
      }
    } catch (error) {
      console.warn('Model listesi API\'den çekilemedi, varsayılan liste kullanılıyor:', error);
    }
  }

  // Fallback: bilinen çalışan modeller
  return [
    { id: 'gemini-1.5-flash', name: '⚡ Gemini 1.5 Flash' },
    { id: 'gemini-1.5-pro', name: '🏆 Gemini 1.5 Pro' },
    { id: 'gemini-2.0-flash-exp', name: '⚡ Gemini 2.0 Flash Experimental' },
    { id: 'gemini-2.0-flash-thinking-exp', name: '🧠 Gemini 2.0 Flash Thinking' }
  ];
}

/**
 * Gemini API çağrısı
 */
export async function callGeminiAPI(
  apiKey: string,
  prompt: string,
  model: string = 'gemini-1.5-flash'
): Promise<string> {
  // Model validasyonu
  const supportedModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-2.0-flash-thinking-exp'];
  const selectedModel = supportedModels.includes(model) ? model : 'gemini-1.5-flash';

  console.log(`Making Gemini API request with model: ${selectedModel}`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topK: 40,
            topP: 1,
            maxOutputTokens: 2048,
            candidateCount: 1,
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
      }
    );

    console.log(`Gemini API response status for ${selectedModel}:`, response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(`Gemini API response data for ${selectedModel}:`, data);
      return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'AI yanıtı alınamadı.'
      );
    } else {
      const errorText = await response.text();
      console.error(`Gemini API error for ${selectedModel}:`, response.status, errorText);
      
      // 404 hatası özel mesajı
      if (response.status === 404) {
        return `Model "${selectedModel}" bulunamadı. Desteklenen modeller: gemini-1.5-flash, gemini-1.5-pro. Lütfen model seçimini kontrol edin.`;
      }
      
      return `Gemini API isteği başarısız (${selectedModel}). API anahtarınızı kontrol edin. Hata: ${response.status}`;
    }
  } catch (error) {
    console.error(`Gemini API call error for ${selectedModel}:`, error);
    return `Gemini API çağrısında hata (${selectedModel}): ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`;
  }
}

/**
 * Gemini API bağlantı testi
 */
export async function testGeminiConnection(apiKey: string, model: string = 'gemini-1.5-flash') {
  try {
    const testPrompt = 'Merhaba, bu bir bağlantı testidir. Kısaca "Test başarılı" şeklinde yanıt verin.';
    const testResponse = await callGeminiAPI(apiKey, testPrompt, model);
    
    if (testResponse.includes('başarısız') || testResponse.includes('hata') || testResponse.includes('bulunamadı')) {
      throw new Error(testResponse);
    }
    
    return {
      success: true,
      message: 'Gemini API bağlantısı başarılı!',
      model: model,
      testResponse: testResponse.substring(0, 100),
      details: {
        response: testResponse
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      model: model
    };
  }
}