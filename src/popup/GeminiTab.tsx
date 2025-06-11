// Gemini Tab Component
// Google Gemini API ayarları, model seçimi ve test fonksiyonları

import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useTheme } from './themeContext';
import { getThemedCommonStyles, generateButtonStyle } from './styles';

interface GeminiTabProps {
  geminiApiKey: string;
  geminiModel: string;
  onGeminiApiKeyChange: (value: string) => void;
  onGeminiModelChange: (value: string) => void;
  onSaveSettings: () => void;
}

const GeminiTab: React.FC<GeminiTabProps> = ({
  geminiApiKey,
  geminiModel,
  onGeminiApiKeyChange,
  onGeminiModelChange,
  onSaveSettings,
}) => {
  const { currentTheme } = useTheme();
  const commonStyles = getThemedCommonStyles(currentTheme === 'dark');
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [geminiModels, setGeminiModels] = useState([
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash Experimental',
      description: 'En yeni experimental model - Hızlı yanıt',
      speed: '⚡ Hızlı',
      quality: '🚀 Yüksek'
    },
    {
      id: 'gemini-2.0-flash-thinking-exp',
      name: 'Gemini 2.0 Flash Thinking',
      description: 'Düşünen model - Derinlemesine analiz',
      speed: '🧠 Düşünce',
      quality: '🚀 Mükemmel'
    }
  ]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Dinamik model yükleme
  const loadAvailableModels = async () => {
    if (!geminiApiKey) {
      console.log('API key yok, varsayılan modeller kullanılıyor');
      return;
    }

    setIsLoadingModels(true);
    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'FETCH_GEMINI_MODELS' },
          (response: any) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          }
        );
      });

      const result = response as any;
      
      if (result.success && result.models) {
        // API'den gelen modelleri güzelleştir
        const enhancedModels = result.models.map((model: any) => ({
          id: model.id,
          name: model.name,
          description: getModelDescription(model.id),
          speed: getModelSpeed(model.id),
          quality: getModelQuality(model.id)
        }));
        
        setGeminiModels(enhancedModels);
        console.log('Dinamik modeller yüklendi:', enhancedModels);
      }
    } catch (error) {
      console.warn('Model listesi yüklenemedi:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Model açıklamalarını getir - 2.x modeller için
  const getModelDescription = (modelId: string) => {
    if (modelId.includes('2.0-flash-exp')) return 'En yeni experimental model - Hızlı yanıt';
    if (modelId.includes('2.0-flash-thinking')) return 'Düşünen model - Derinlemesine analiz';
    if (modelId.includes('2.5-flash')) return 'Gelişmiş hızlı model - Günlük kulanım';
    if (modelId.includes('2.5-pro')) return 'En kapsamlı 2.5 model - Maksimum kalite';
    if (modelId.includes('2.0-pro')) return 'Profesyonel 2.0 model - Yüksek kalite';
    if (modelId.includes('flash')) return 'Hızlı yanıt modeli';
    if (modelId.includes('pro')) return 'Profesyonel seviye analiz';
    return 'Google Gemini 2.x AI modeli';
  };

  const getModelSpeed = (modelId: string) => {
    if (modelId.includes('flash')) return '⚡ Hızlı';
    if (modelId.includes('thinking')) return '🧠 Düşünce';
    if (modelId.includes('pro')) return '🐌 Yavaş';
    return '⚖️ Orta';
  };

  const getModelQuality = (modelId: string) => {
    if (modelId.includes('2.5-pro')) return '🚀 Mükemmel';
    if (modelId.includes('2.0-pro')) return '🎯 Yüksek';
    if (modelId.includes('thinking')) return '🧠 Derin';
    if (modelId.includes('flash')) return '⚡ İyi';
    return '✅ Standart';
  };

  // API key değiştiğinde modelleri yeniden yükle
  useEffect(() => {
    if (geminiApiKey) {
      loadAvailableModels();
    }
  }, [geminiApiKey]);

  // İlk model seçimi
  useEffect(() => {
    if (!geminiModel && geminiModels.length > 0) {
      onGeminiModelChange(geminiModels[0].id);
    }
  }, [geminiModel, geminiModels, onGeminiModelChange]);

  // Model bilgileri
  const _getModelDetails = (modelId: string) => {
    const model = geminiModels.find(m => m.id === modelId);
    return model || {
      description: 'Model bilgisi bulunamadı',
      speed: '❓ Bilinmiyor',
      quality: '❓ Bilinmiyor'
    };
  };

  // Gemini API test fonksiyonu
  const testGeminiAPI = async () => {
    if (!geminiApiKey) {
      setTestResult('❌ API anahtarı boş olamaz');
      return;
    }

    setIsTestingAPI(true);
    setTestResult('🔍 API bağlantısı test ediliyor...');

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'TEST_GEMINI_API',
            apiKey: geminiApiKey,
            model: geminiModel,
          },
          (response: any) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          }
        );
      });

      const result = response as any;
      
      if (result.success) {
        setTestResult(`✅ ${result.message}\n\n🤖 Model: ${result.model}\n\n💬 Test Yanıtı:\n"${result.testResponse}"`);
        if (result.details?.response) {
          setTestResult(prev => prev + `\n\n💬 Test yanıtı: ${result.details.response.substring(0, 150)}...`);
        }
      } else {
        setTestResult(`❌ ${result.error}\n\nKontrol listesi:\n• API anahtarı geçerli mi?\n• İnternet bağlantısı var mı?\n• Model destekleniyor mu?`);
      }
    } catch (error) {
      setTestResult(`❌ Test hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsTestingAPI(false);
    }
  };
  
  return (
    <div style={{ padding: '24px', ...commonStyles.animations.fadeIn }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={commonStyles.iconContainer(64, commonStyles.gradients.indigo)}>
          <Icons.Brain />
        </div>
        <h2 style={commonStyles.text.heading}>
          Google Gemini AI
        </h2>
        <p style={commonStyles.text.subheading}>
          Google'ın gelişmiş dil modeli ailesi
        </p>
      </div>

      {/* Model Selection */}
      <div style={{ ...commonStyles.card, marginBottom: '24px' }}>
        <div style={{ ...commonStyles.sectionHeader, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Icons.Settings />
            <h3 style={{
              fontWeight: '600',
              color: commonStyles.colors.text.primary,
              marginLeft: '8px',
              margin: 0,
            }}>
              Model Seçimi
            </h3>
          </div>
          <button
            onClick={loadAvailableModels}
            disabled={!geminiApiKey || isLoadingModels}
            style={{
              background: 'transparent',
              border: `1px solid ${commonStyles.colors.border}`,
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.75rem',
              color: commonStyles.colors.text.secondary,
              cursor: (!geminiApiKey || isLoadingModels) ? 'not-allowed' : 'pointer',
              opacity: (!geminiApiKey || isLoadingModels) ? 0.5 : 1,
              transition: 'all 0.2s ease',
            }}
            title="Mevcut modelleri API'den yenile"
          >
            {isLoadingModels ? '🔄 Yükleniyor...' : '🔄 Modelleri Yenile'}
          </button>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={commonStyles.text.label}>
            Model Seçiniz
          </label>
          <select
            value={geminiModel}
            onChange={(e) => onGeminiModelChange(e.target.value)}
            style={{
              ...commonStyles.input,
              padding: '12px',
              fontSize: '1rem',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
              paddingRight: '48px',
              cursor: 'pointer',
            }}
          >
            {geminiModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          
          {/* Seçilen model bilgileri */}
          {geminiModel && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: currentTheme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              border: `1px solid ${commonStyles.colors.border}`,
              borderRadius: '6px',
            }}>
              {(() => {
                const selectedModel = geminiModels.find(m => m.id === geminiModel);
                return selectedModel ? (
                  <>
                    <div style={{
                      fontWeight: '600',
                      color: commonStyles.colors.text.primary,
                      marginBottom: '6px'
                    }}>
                      {selectedModel.name}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: commonStyles.colors.text.secondary,
                      marginBottom: '8px'
                    }}>
                      {selectedModel.description}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem' }}>
                      <span style={{ color: commonStyles.colors.text.secondary }}>
                        {selectedModel.speed}
                      </span>
                      <span style={{ color: commonStyles.colors.text.secondary }}>
                        {selectedModel.quality}
                      </span>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>

      {/* API Key Configuration */}
      <div style={{ ...commonStyles.card, marginBottom: '24px' }}>
        <div style={commonStyles.sectionHeader}>
          <Icons.Settings />
          <h3 style={{
            fontWeight: '600',
            color: commonStyles.colors.text.primary,
            marginLeft: '8px',
            margin: 0,
          }}>
            API Konfigürasyonu
          </h3>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={commonStyles.text.label}>
            Google AI Studio API Anahtarı
          </label>
          <input
            type="password"
            value={geminiApiKey}
            onChange={e => onGeminiApiKeyChange(e.target.value)}
            placeholder="API anahtarınızı buraya girin..."
            style={commonStyles.input}
          />
          <p style={{
            color: commonStyles.colors.text.secondary,
            fontSize: '0.75rem',
            marginTop: '8px'
          }}>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: commonStyles.colors.primary, textDecoration: 'underline' }}
            >
              Google AI Studio
            </a>'dan ücretsiz API anahtarı alabilirsiniz
          </p>
        </div>

        {/* Test Button */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={testGeminiAPI}
            disabled={!geminiApiKey || isTestingAPI}
            style={{
              ...generateButtonStyle('primary', currentTheme === 'dark'),
              fontSize: '0.875rem',
              padding: '8px 16px',
              opacity: (!geminiApiKey || isTestingAPI) ? 0.5 : 1,
              cursor: (!geminiApiKey || isTestingAPI) ? 'not-allowed' : 'pointer',
            }}
          >
            {isTestingAPI ? '🔍 Test Ediliyor...' : '🔍 API Bağlantısını Test Et'}
          </button>
          
          <button
            onClick={onSaveSettings}
            style={{
              ...generateButtonStyle('success', currentTheme === 'dark'),
              fontSize: '0.875rem',
              padding: '8px 16px',
            }}
          >
            💾 Ayarları Kaydet
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: testResult.includes('✅') ? 
              (currentTheme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)') :
              (currentTheme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'),
            border: `1px solid ${testResult.includes('✅') ? 
              (currentTheme === 'dark' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)') :
              (currentTheme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)')}`,
            fontSize: '0.875rem',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            color: commonStyles.colors.text.primary,
          }}>
            {testResult}
          </div>
        )}
      </div>

      {/* Model Comparison Info */}
      <div style={{ ...commonStyles.card, marginBottom: '24px' }}>
        <div style={commonStyles.sectionHeader}>
          <Icons.Info />
          <h3 style={{
            fontWeight: '600',
            color: commonStyles.colors.text.primary,
            marginLeft: '8px',
            margin: 0,
          }}>
            Model Karşılaştırması
          </h3>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.875rem', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: commonStyles.colors.text.primary }}>⚡ Gemini 1.5 Flash</strong>
            <p style={{ margin: '4px 0', color: commonStyles.colors.text.secondary }}>
              • Hızlı yanıt süresi (~2-4 saniye)<br/>
              • Günlük kullanım için ideal<br/>
              • Gelişmiş WCAG analizi ve önerileri<br/>
              • Maliyet etkin seçenek
            </p>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: commonStyles.colors.text.primary }}>🏆 Gemini 1.5 Pro</strong>
            <p style={{ margin: '4px 0', color: commonStyles.colors.text.secondary }}>
              • Yavaş yanıt süresi (~5-10 saniye)<br/>
              • En kapsamlı ve detaylı analiz<br/>
              • Profesyonel seviye öneriler ve best practices<br/>
              • Karmaşık durumlar için en iyi seçenek
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiTab;