/* Pawan Satoshi Academy — global learning controls
 *
 * Translation is an optional enhancement. The core site remains usable when
 * the translation provider is unavailable. Speech uses the browser/device
 * Web Speech API and therefore does not require an API key.
 *
 * India language coverage includes all 22 languages listed by the Government
 * of India's Legislative Department under its regional-language resources.
 * The architecture remains open to additional Indian languages.
 */
(function () {
  const LANGUAGE_STORAGE_KEY = 'psa.locale';
  const RATE_STORAGE_KEY = 'psa.voice.rate';
  const PITCH_STORAGE_KEY = 'psa.voice.pitch';

  const languageOptions = [
    ['auto', 'Auto / Device language'],
    ['en', 'English'],

    // India — all 22 Eighth Schedule languages
    ['as', 'অসমীয়া — Assamese'],
    ['bn', 'বাংলা — Bengali'],
    ['brx', 'बड़ो — Bodo'],
    ['doi', 'डोगरी — Dogri'],
    ['gu', 'ગુજરાતી — Gujarati'],
    ['hi', 'हिन्दी — Hindi'],
    ['kn', 'ಕನ್ನಡ — Kannada'],
    ['ks', 'کٲشُر — Kashmiri'],
    ['kok', 'कोंकणी — Konkani'],
    ['mai', 'मैथिली — Maithili'],
    ['ml', 'മലയാളം — Malayalam'],
    ['mni', 'মৈতৈলোন — Manipuri'],
    ['mr', 'मराठी — Marathi'],
    ['ne', 'नेपाली — Nepali'],
    ['or', 'ଓଡ଼ିଆ — Odia'],
    ['pa', 'ਪੰਜਾਬੀ — Punjabi'],
    ['sa', 'संस्कृतम् — Sanskrit'],
    ['sat', 'ᱥᱟᱱᱛᱟᱲᱤ — Santali'],
    ['sd', 'سنڌي — Sindhi'],
    ['ta', 'தமிழ் — Tamil'],
    ['te', 'తెలుగు — Telugu'],
    ['ur', 'اردو — Urdu'],

    // Initial wider global coverage
    ['es', 'Español'], ['pt', 'Português'], ['fr', 'Français'], ['de', 'Deutsch'],
    ['ar', 'العربية'], ['id', 'Bahasa Indonesia'], ['tr', 'Türkçe'],
    ['vi', 'Tiếng Việt'], ['ja', '日本語'], ['ko', '한국어'],
    ['zh-CN', '简体中文'], ['zh-TW', '繁體中文'], ['it', 'Italiano'],
    ['nl', 'Nederlands'], ['pl', 'Polski'], ['ru', 'Русский'],
    ['uk', 'Українська'], ['th', 'ไทย'], ['sw', 'Kiswahili']
  ];

  function normalizeLocale(locale) {
    return (locale || navigator.language || 'en').replace('_', '-');
  }

  function selectedLocale() {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored || 'auto';
  }

  function createLanguageControl() {
    const host = document.querySelector('[data-global-tools]');
    if (!host) return;
    const label = document.createElement('label');
    label.className = 'global-control';
    label.innerHTML = '<span>Language</span>';
    const select = document.createElement('select');
    select.id = 'language-select';
    select.setAttribute('aria-label', 'Learning language');
    for (const [value, name] of languageOptions) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = name;
      select.appendChild(option);
    }
    select.value = selectedLocale();
    select.addEventListener('change', () => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, select.value);
      applyTranslation(select.value);
    });
    label.appendChild(select);
    host.appendChild(label);
  }

  function loadGoogleTranslate() {
    if (window.google && window.google.translate) return;
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        autoDisplay: false,
        includedLanguages: languageOptions.filter(([v]) => v !== 'auto').map(([v]) => v).join(',')
      }, 'google_translate_element');
    };
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => document.documentElement.dataset.translationUnavailable = 'true';
    document.head.appendChild(script);
  }

  function applyTranslation(locale) {
    if (locale === 'auto') {
      const detected = normalizeLocale(navigator.language).split('-')[0];
      if (detected === 'en') return;
      return applyGoogleLanguage(detected);
    }
    applyGoogleLanguage(locale);
  }

  function applyGoogleLanguage(locale) {
    const select = document.querySelector('.goog-te-combo');
    if (!select) {
      loadGoogleTranslate();
      setTimeout(() => applyGoogleLanguage(locale), 700);
      return;
    }
    const target = locale.toLowerCase();
    const option = Array.from(select.options).find(o => o.value.toLowerCase() === target);
    if (option) {
      select.value = option.value;
      select.dispatchEvent(new Event('change'));
    }
  }

  function speechSupported() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  function lessonText() {
    const article = document.querySelector('#lesson');
    if (!article) return '';
    return Array.from(article.querySelectorAll('h1,h2,h3,p,li'))
      .filter(el => !el.closest('[data-learning-controls]'))
      .map(el => el.innerText.trim())
      .filter(Boolean)
      .join('. ');
  }

  function voiceForLocale(locale) {
    if (!speechSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const target = normalizeLocale(locale === 'auto' ? navigator.language : locale).toLowerCase();
    const base = target.split('-')[0];
    return voices.find(v => v.lang.toLowerCase() === target) ||
      voices.find(v => v.lang.toLowerCase().startsWith(base + '-')) ||
      voices.find(v => v.lang.toLowerCase().startsWith(base));
  }

  function createVoiceControls() {
    const host = document.querySelector('[data-voice-tools]');
    if (!host || !speechSupported()) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'voice-tools';
    wrapper.setAttribute('data-learning-controls', 'true');
    wrapper.innerHTML = `
      <span class="voice-title">🔊 Listen</span>
      <button type="button" class="button secondary voice-button" data-voice="play">Play</button>
      <button type="button" class="button secondary voice-button" data-voice="pause">Pause</button>
      <button type="button" class="button secondary voice-button" data-voice="stop">Stop</button>
      <label class="voice-slider"><span>Speed</span><input data-voice-rate type="range" min="0.6" max="1.4" step="0.1" value="${localStorage.getItem(RATE_STORAGE_KEY) || '1'}"></label>
      <label class="voice-slider"><span>Pitch</span><input data-voice-pitch type="range" min="0.7" max="1.3" step="0.1" value="${localStorage.getItem(PITCH_STORAGE_KEY) || '1'}"></label>
      <span class="voice-status" aria-live="polite">Ready</span>`;
    host.appendChild(wrapper);

    const rate = wrapper.querySelector('[data-voice-rate]');
    const pitch = wrapper.querySelector('[data-voice-pitch]');
    const status = wrapper.querySelector('.voice-status');

    function stop() {
      window.speechSynthesis.cancel();
      status.textContent = 'Stopped';
    }

    wrapper.querySelector('[data-voice="play"]').addEventListener('click', () => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        status.textContent = 'Playing';
        return;
      }
      stop();
      const text = lessonText();
      if (!text) { status.textContent = 'No lesson text available'; return; }
      const locale = selectedLocale() === 'auto' ? navigator.language : selectedLocale();
      const voice = voiceForLocale(locale);
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
      utterance.rate = Number(rate.value);
      utterance.pitch = Number(pitch.value);
      utterance.onstart = () => { status.textContent = `Playing${voice ? ` · ${voice.name}` : ''}`; };
      utterance.onend = () => { status.textContent = 'Finished'; };
      utterance.onerror = () => { status.textContent = 'Voice playback unavailable'; };
      window.speechSynthesis.speak(utterance);
    });
    wrapper.querySelector('[data-voice="pause"]').addEventListener('click', () => {
      if (window.speechSynthesis.speaking) { window.speechSynthesis.pause(); status.textContent = 'Paused'; }
    });
    wrapper.querySelector('[data-voice="stop"]').addEventListener('click', stop);
    rate.addEventListener('input', () => localStorage.setItem(RATE_STORAGE_KEY, rate.value));
    pitch.addEventListener('input', () => localStorage.setItem(PITCH_STORAGE_KEY, pitch.value));
    window.speechSynthesis.addEventListener('voiceschanged', () => { status.textContent = 'Ready'; });
  }

  function init() {
    createLanguageControl();
    loadGoogleTranslate();
    const locale = selectedLocale();
    if (locale !== 'en') setTimeout(() => applyTranslation(locale), 1000);
    createVoiceControls();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
