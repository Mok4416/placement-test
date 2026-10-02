// Comprehensive 4-Skills CEFR Assessment Engine with CBM & Gemini AI Integration

// Global State
let state = {
  currentView: 'register', // 'register', 'exam', 'finished', 'admin'
  candidate: null,
  examDurationMinutes: parseInt(localStorage.getItem('cefr_exam_duration')) || 65,
  remainingSeconds: 65 * 60,
  timerInterval: null,
  activeModule: 'grammar', // 'grammar', 'listening', 'writing', 'speaking'
  currentQuestionIndex: 0, // 0 to 29 for grammar, 0 to 14 for listening
  activeListeningTrack: 0,
  activeWritingTask: 0,
  activeSpeakingPrompt: 0,

  // Answers & Time Tracking
  grammarAnswers: {}, // { [id]: { option, certainty, timeSpentSeconds } }
  listeningAnswers: {}, // { [id]: { option, certainty, timeSpentSeconds } }
  writingAnswers: {
    W1: { text: "", wordCount: 0, timeSpentSeconds: 0 },
    W2: { text: "", wordCount: 0, timeSpentSeconds: 0 }
  },
  speakingRecordings: {
    S1: { audioDataUrl: null, durationSeconds: 0, recordedAt: null },
    S2: { audioDataUrl: null, durationSeconds: 0, recordedAt: null },
    S3: { audioDataUrl: null, durationSeconds: 0, recordedAt: null }
  },

  flagged: new Set(),
  activeQuestionStartTime: null,
  examStartTime: null,
  mediaRecorder: null,
  recordedAudioChunks: [],
  isRecording: false,
  recordingTimerInterval: null,
  recordingSecondsElapsed: 0
};

// Admin & API Configuration
const DEFAULT_ADMIN = { username: 'admin', password: 'admin123' };

function getAdminCredentials() {
  const saved = localStorage.getItem('cefr_admin_creds');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return DEFAULT_ADMIN;
}

function saveAdminCredentials(username, password) {
  localStorage.setItem('cefr_admin_creds', JSON.stringify({ username, password }));
}

function getGeminiApiKey() {
  return localStorage.getItem('cefr_gemini_api_key') || '';
}

function saveGeminiApiKey(key) {
  localStorage.setItem('cefr_gemini_api_key', key.trim());
}

// Submissions Storage
function getSubmissions() {
  const saved = localStorage.getItem('cefr_submissions');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { return []; }
  }
  return [];
}

function saveSubmission(submission) {
  const list = getSubmissions();
  list.unshift(submission);
  localStorage.setItem('cefr_submissions', JSON.stringify(list));
}

function updateSubmission(updatedSub) {
  const list = getSubmissions().map(s => s.id === updatedSub.id ? updatedSub : s);
  localStorage.setItem('cefr_submissions', JSON.stringify(list));
}

function deleteSubmission(id) {
  const list = getSubmissions().filter(s => s.id !== id);
  localStorage.setItem('cefr_submissions', JSON.stringify(list));
}

function clearAllSubmissions() {
  localStorage.removeItem('cefr_submissions');
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initViews();
  setupEventListeners();
  setupAudioSynthesis();
});

function initViews() {
  showView('register');
  const dur = parseInt(localStorage.getItem('cefr_exam_duration')) || 65;
  state.examDurationMinutes = dur;
  const regDur = document.getElementById('regExamDuration');
  if (regDur) regDur.textContent = `${dur} minutes`;
}

function showView(viewName) {
  state.currentView = viewName;
  ['viewRegister', 'viewExam', 'viewFinished', 'viewAdmin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  const activeEl = document.getElementById(`view${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
  if (activeEl) activeEl.classList.remove('hidden');

  if (viewName === 'admin') {
    renderAdminDashboard();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Registration
  const regForm = document.getElementById('registrationForm');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      startExam();
    });
  }

  // Module Tabs in Exam View
  document.querySelectorAll('.module-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchModule(btn.dataset.module);
    });
  });

  // Global Submit Button
  const submitBtn = document.getElementById('btnSubmitExam');
  if (submitBtn) submitBtn.addEventListener('click', promptSubmitExam);

  // Home return button
  const homeBtn = document.getElementById('btnReturnHome');
  if (homeBtn) homeBtn.addEventListener('click', () => showView('register'));

  // Admin access
  document.getElementById('openAdminLoginBtn').addEventListener('click', () => {
    document.getElementById('adminLoginModal').classList.remove('hidden');
  });
  document.getElementById('closeAdminLoginBtn').addEventListener('click', () => {
    document.getElementById('adminLoginModal').classList.add('hidden');
  });
  document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
  document.getElementById('adminLogoutBtn').addEventListener('click', () => showView('register'));

  // Admin Settings
  document.getElementById('saveDurationBtn').addEventListener('click', handleSaveDuration);
  document.getElementById('saveApiKeyBtn').addEventListener('click', handleSaveApiKey);
  document.getElementById('testApiKeyBtn').addEventListener('click', handleTestApiKey);
  document.getElementById('changeCredsForm').addEventListener('submit', handleChangeCreds);

  // Admin Table & Exports
  document.getElementById('exportCsvBtn').addEventListener('click', exportAllToCsv);
  document.getElementById('clearAllBtn').addEventListener('click', handleClearAll);

  // Speaking Recording controls
  document.getElementById('btnStartRecord').addEventListener('click', toggleRecording);
}

// Start Assessment
function startExam() {
  const name = document.getElementById('studentName').value.trim();
  const phone = document.getElementById('studentPhone').value.trim();
  const email = document.getElementById('studentEmail').value.trim() || 'N/A';

  if (!name || !phone) {
    alert('Please enter your full name and contact number.');
    return;
  }

  state.candidate = {
    name,
    phone,
    email,
    startedAt: new Date().toISOString()
  };

  // Reset state
  state.grammarAnswers = {};
  CEFR_EXAM_DATA.grammarQuestions.forEach(q => {
    state.grammarAnswers[q.id] = { option: null, certainty: null, timeSpentSeconds: 0 };
  });

  state.listeningAnswers = {};
  CEFR_EXAM_DATA.listeningTracks.forEach(t => {
    t.questions.forEach(q => {
      state.listeningAnswers[q.id] = { option: null, certainty: null, timeSpentSeconds: 0 };
    });
  });

  state.writingAnswers = {
    W1: { text: "", wordCount: 0, timeSpentSeconds: 0 },
    W2: { text: "", wordCount: 0, timeSpentSeconds: 0 }
  };

  state.speakingRecordings = {
    S1: { audioDataUrl: null, durationSeconds: 0, recordedAt: null },
    S2: { audioDataUrl: null, durationSeconds: 0, recordedAt: null },
    S3: { audioDataUrl: null, durationSeconds: 0, recordedAt: null }
  };

  state.flagged = new Set();
  state.remainingSeconds = state.examDurationMinutes * 60;
  state.examStartTime = Date.now();
  state.activeQuestionStartTime = Date.now();

  document.getElementById('examCandidateName').textContent = name;

  showView('exam');
  switchModule('grammar');
  startTimer();
}

// Timer Controller
function startTimer() {
  clearInterval(state.timerInterval);
  updateTimerDisplay();

  state.timerInterval = setInterval(() => {
    state.remainingSeconds--;
    updateTimerDisplay();

    if (state.remainingSeconds <= 0) {
      clearInterval(state.timerInterval);
      alert('Time is up! Your exam will now be automatically submitted.');
      finalizeExam(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(state.remainingSeconds / 60);
  const secs = state.remainingSeconds % 60;
  const str = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const timerEl = document.getElementById('examTimer');
  if (timerEl) timerEl.textContent = str;

  const wrapper = document.getElementById('timerWrapper');
  if (wrapper) {
    wrapper.className = 'timer-pill ' + (state.remainingSeconds <= 300 ? 'timer-danger' : (state.remainingSeconds <= 900 ? 'timer-warning' : 'timer-normal'));
  }
}

// Switch Active Module
function switchModule(moduleName) {
  accumulateTime();
  state.activeModule = moduleName;
  state.activeQuestionStartTime = Date.now();

  // Update tabs UI
  document.querySelectorAll('.module-tab-btn').forEach(btn => {
    if (btn.dataset.module === moduleName) {
      btn.className = 'module-tab-btn px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 text-white shadow-sm transition';
    } else {
      btn.className = 'module-tab-btn px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition';
    }
  });

  // Hide all module panels
  document.getElementById('panelGrammar').classList.add('hidden');
  document.getElementById('panelListening').classList.add('hidden');
  document.getElementById('panelWriting').classList.add('hidden');
  document.getElementById('panelSpeaking').classList.add('hidden');

  if (moduleName === 'grammar') {
    document.getElementById('panelGrammar').classList.remove('hidden');
    renderGrammarQuestion();
    renderGrammarPalette();
  } else if (moduleName === 'listening') {
    document.getElementById('panelListening').classList.remove('hidden');
    renderListeningTrack();
    renderListeningQuestion();
    renderListeningPalette();
  } else if (moduleName === 'writing') {
    document.getElementById('panelWriting').classList.remove('hidden');
    renderWritingTask();
  } else if (moduleName === 'speaking') {
    document.getElementById('panelSpeaking').classList.remove('hidden');
    renderSpeakingPrompt();
  }

  updateGlobalProgress();
}

function accumulateTime() {
  if (state.activeQuestionStartTime === null) return;
  const elapsed = Math.max(1, Math.round((Date.now() - state.activeQuestionStartTime) / 1000));

  if (state.activeModule === 'grammar') {
    const q = CEFR_EXAM_DATA.grammarQuestions[state.currentQuestionIndex];
    if (q && state.grammarAnswers[q.id]) {
      state.grammarAnswers[q.id].timeSpentSeconds += elapsed;
    }
  } else if (state.activeModule === 'listening') {
    const track = CEFR_EXAM_DATA.listeningTracks[state.activeListeningTrack];
    const q = track.questions[state.currentQuestionIndex];
    if (q && state.listeningAnswers[q.id]) {
      state.listeningAnswers[q.id].timeSpentSeconds += elapsed;
    }
  } else if (state.activeModule === 'writing') {
    const task = CEFR_EXAM_DATA.writingTasks[state.activeWritingTask];
    if (task && state.writingAnswers[task.id]) {
      state.writingAnswers[task.id].timeSpentSeconds += elapsed;
    }
  }
  state.activeQuestionStartTime = Date.now();
}

// ---------------- MODULE 1: GRAMMAR & VOCABULARY ----------------

function renderGrammarQuestion() {
  const q = CEFR_EXAM_DATA.grammarQuestions[state.currentQuestionIndex];
  const ans = state.grammarAnswers[q.id];

  document.getElementById('gIndexBadge').textContent = `Question ${q.id} of 30`;
  document.getElementById('gCefrTag').textContent = `CEFR Level ${q.cefr}`;
  document.getElementById('gSkillTag').textContent = q.skill;
  document.getElementById('gText').textContent = `${q.id}. ${q.text}`;

  const container = document.getElementById('gOptionsContainer');
  container.innerHTML = '';

  ['A', 'B', 'C', 'D'].forEach(letter => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `option-btn ${ans.option === letter ? 'selected' : ''}`;
    btn.innerHTML = `<span class="option-letter">${letter}</span><span class="flex-1">${q.options[letter]}</span>`;
    btn.onclick = () => {
      ans.option = letter;
      renderGrammarQuestion();
      renderGrammarPalette();
      updateGlobalProgress();
    };
    container.appendChild(btn);
  });

  // Certainty
  const sureBtn = document.getElementById('btnGSure');
  const notSureBtn = document.getElementById('btnGNotSure');
  sureBtn.className = `certainty-btn ${ans.certainty === 'sure' ? 'sure-active' : ''}`;
  notSureBtn.className = `certainty-btn ${ans.certainty === 'notsure' ? 'notsure-active' : ''}`;

  sureBtn.onclick = () => {
    ans.certainty = 'sure';
    renderGrammarQuestion();
    renderGrammarPalette();
  };
  notSureBtn.onclick = () => {
    ans.certainty = 'notsure';
    renderGrammarQuestion();
    renderGrammarPalette();
  };

  // Nav buttons
  document.getElementById('btnGPrev').disabled = (state.currentQuestionIndex === 0);
  document.getElementById('btnGNext').disabled = (state.currentQuestionIndex === CEFR_EXAM_DATA.grammarQuestions.length - 1);

  document.getElementById('btnGPrev').onclick = () => {
    accumulateTime();
    state.currentQuestionIndex--;
    renderGrammarQuestion();
    renderGrammarPalette();
  };
  document.getElementById('btnGNext').onclick = () => {
    accumulateTime();
    state.currentQuestionIndex++;
    renderGrammarQuestion();
    renderGrammarPalette();
  };
}

function renderGrammarPalette() {
  const grid = document.getElementById('grammarPaletteGrid');
  grid.innerHTML = '';

  CEFR_EXAM_DATA.grammarQuestions.forEach((q, idx) => {
    const ans = state.grammarAnswers[q.id];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'palette-btn';
    btn.textContent = q.id;

    if (idx === state.currentQuestionIndex) btn.classList.add('current');
    if (ans.option && ans.certainty) btn.classList.add('complete');
    else if (ans.option) btn.classList.add('partial');

    btn.onclick = () => {
      accumulateTime();
      state.currentQuestionIndex = idx;
      renderGrammarQuestion();
      renderGrammarPalette();
    };
    grid.appendChild(btn);
  });
}

// ---------------- MODULE 2: LISTENING COMPREHENSION ----------------

let currentUtterance = null;

function setupAudioSynthesis() {
  // Check if browser speech synthesis is supported
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not available.');
  }
}

function playTrackAudio(text) {
  if (!('speechSynthesis' in window)) {
    alert('Audio synthesis is not supported on this browser.');
    return;
  }
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB'; // British English for IELTS style
  utterance.rate = 0.95;

  const playBtn = document.getElementById('btnPlayAudio');
  if (playBtn) playBtn.innerHTML = '⏸️ Audio Playing...';

  utterance.onend = () => {
    if (playBtn) playBtn.innerHTML = '▶️ Replay Audio Track';
  };
  utterance.onerror = () => {
    if (playBtn) playBtn.innerHTML = '▶️ Play Audio Track';
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function stopTrackAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  const playBtn = document.getElementById('btnPlayAudio');
  if (playBtn) playBtn.innerHTML = '▶️ Play Audio Track';
}

function renderListeningTrack() {
  const track = CEFR_EXAM_DATA.listeningTracks[state.activeListeningTrack];
  document.getElementById('lTrackTitle').textContent = track.title;
  document.getElementById('lTrackDesc').textContent = track.description;

  const playBtn = document.getElementById('btnPlayAudio');
  playBtn.onclick = () => {
    playTrackAudio(track.transcript);
  };

  // Track Selector buttons
  const tabsContainer = document.getElementById('listeningTrackTabs');
  tabsContainer.innerHTML = '';
  CEFR_EXAM_DATA.listeningTracks.forEach((t, idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `px-3 py-1.5 rounded-lg text-xs font-bold transition ${idx === state.activeListeningTrack ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`;
    b.textContent = `Track ${idx + 1} (${t.level})`;
    b.onclick = () => {
      stopTrackAudio();
      accumulateTime();
      state.activeListeningTrack = idx;
      state.currentQuestionIndex = 0;
      renderListeningTrack();
      renderListeningQuestion();
      renderListeningPalette();
    };
    tabsContainer.appendChild(b);
  });
}

function renderListeningQuestion() {
  const track = CEFR_EXAM_DATA.listeningTracks[state.activeListeningTrack];
  const q = track.questions[state.currentQuestionIndex];
  const ans = state.listeningAnswers[q.id];

  document.getElementById('lIndexBadge').textContent = `Question ${q.id} of 45`;
  document.getElementById('lCefrTag').textContent = `CEFR ${q.cefr}`;
  document.getElementById('lSkillTag').textContent = q.skill;
  document.getElementById('lText').textContent = `${q.id}. ${q.text}`;

  const container = document.getElementById('lOptionsContainer');
  container.innerHTML = '';

  ['A', 'B', 'C', 'D'].forEach(letter => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `option-btn ${ans.option === letter ? 'selected' : ''}`;
    btn.innerHTML = `<span class="option-letter">${letter}</span><span class="flex-1">${q.options[letter]}</span>`;
    btn.onclick = () => {
      ans.option = letter;
      renderListeningQuestion();
      renderListeningPalette();
      updateGlobalProgress();
    };
    container.appendChild(btn);
  });

  // Certainty
  const sureBtn = document.getElementById('btnLSure');
  const notSureBtn = document.getElementById('btnLNotSure');
  sureBtn.className = `certainty-btn ${ans.certainty === 'sure' ? 'sure-active' : ''}`;
  notSureBtn.className = `certainty-btn ${ans.certainty === 'notsure' ? 'notsure-active' : ''}`;

  sureBtn.onclick = () => {
    ans.certainty = 'sure';
    renderListeningQuestion();
    renderListeningPalette();
  };
  notSureBtn.onclick = () => {
    ans.certainty = 'notsure';
    renderListeningQuestion();
    renderListeningPalette();
  };

  // Nav
  document.getElementById('btnLPrev').disabled = (state.currentQuestionIndex === 0);
  document.getElementById('btnLNext').disabled = (state.currentQuestionIndex === track.questions.length - 1);

  document.getElementById('btnLPrev').onclick = () => {
    accumulateTime();
    state.currentQuestionIndex--;
    renderListeningQuestion();
    renderListeningPalette();
  };
  document.getElementById('btnLNext').onclick = () => {
    accumulateTime();
    state.currentQuestionIndex++;
    renderListeningQuestion();
    renderListeningPalette();
  };
}

function renderListeningPalette() {
  const grid = document.getElementById('listeningPaletteGrid');
  grid.innerHTML = '';

  const track = CEFR_EXAM_DATA.listeningTracks[state.activeListeningTrack];
  track.questions.forEach((q, idx) => {
    const ans = state.listeningAnswers[q.id];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'palette-btn';
    btn.textContent = q.id;

    if (idx === state.currentQuestionIndex) btn.classList.add('current');
    if (ans.option && ans.certainty) btn.classList.add('complete');
    else if (ans.option) btn.classList.add('partial');

    btn.onclick = () => {
      accumulateTime();
      state.currentQuestionIndex = idx;
      renderListeningQuestion();
      renderListeningPalette();
    };
    grid.appendChild(btn);
  });
}

// ---------------- MODULE 3: WRITING (TASKS 1 & 2) ----------------

function renderWritingTask() {
  const task = CEFR_EXAM_DATA.writingTasks[state.activeWritingTask];
  const ans = state.writingAnswers[task.id];

  document.getElementById('wTaskTitle').textContent = task.title;
  document.getElementById('wCefrTarget').textContent = `Target Level: ${task.cefrTarget}`;
  document.getElementById('wWordLimitBadge').textContent = task.wordCountRange;
  document.getElementById('wPromptText').innerText = task.prompt;
  document.getElementById('wGuidanceText').textContent = task.guidance;

  const textarea = document.getElementById('writingTextarea');
  textarea.value = ans.text;
  updateWritingWordCount(ans.text);

  textarea.oninput = (e) => {
    ans.text = e.target.value;
    updateWritingWordCount(ans.text);
    updateGlobalProgress();
  };

  // Task 1 / Task 2 Switcher Tabs
  const task1Btn = document.getElementById('btnTask1');
  const task2Btn = document.getElementById('btnTask2');

  task1Btn.className = `px-4 py-2 rounded-xl text-xs font-bold transition ${state.activeWritingTask === 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`;
  task2Btn.className = `px-4 py-2 rounded-xl text-xs font-bold transition ${state.activeWritingTask === 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`;

  task1Btn.onclick = () => {
    accumulateTime();
    state.activeWritingTask = 0;
    renderWritingTask();
  };
  task2Btn.onclick = () => {
    accumulateTime();
    state.activeWritingTask = 1;
    renderWritingTask();
  };
}

function updateWritingWordCount(text) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const count = words.length;
  const task = CEFR_EXAM_DATA.writingTasks[state.activeWritingTask];
  state.writingAnswers[task.id].wordCount = count;

  document.getElementById('writingWordCounter').textContent = `${count} Words`;
}

// ---------------- MODULE 4: SPEAKING (PROMPTS 1, 2, 3) ----------------

function renderSpeakingPrompt() {
  const p = CEFR_EXAM_DATA.speakingPrompts[state.activeSpeakingPrompt];
  const rec = state.speakingRecordings[p.id];

  document.getElementById('sPromptTitle').textContent = p.title;
  document.getElementById('sCefrTarget').textContent = `Target: ${p.cefrTarget}`;
  document.getElementById('sMaxTime').textContent = `Max Recording Time: ${p.maxRecordingSeconds} seconds`;
  document.getElementById('sPromptText').innerText = p.prompt;

  // Prompts tabs
  const tabsContainer = document.getElementById('speakingPromptTabs');
  tabsContainer.innerHTML = '';
  CEFR_EXAM_DATA.speakingPrompts.forEach((pr, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `px-3 py-1.5 rounded-lg text-xs font-bold transition ${idx === state.activeSpeakingPrompt ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`;
    const hasAudio = !!state.speakingRecordings[pr.id].audioDataUrl;
    btn.innerHTML = `Part ${idx + 1} ${hasAudio ? '✓' : ''}`;
    btn.onclick = () => {
      if (state.isRecording) stopRecording();
      state.activeSpeakingPrompt = idx;
      renderSpeakingPrompt();
    };
    tabsContainer.appendChild(btn);
  });

  // Player preview
  const audioPreview = document.getElementById('speakingAudioPreview');
  if (rec.audioDataUrl) {
    audioPreview.src = rec.audioDataUrl;
    audioPreview.classList.remove('hidden');
    document.getElementById('speakingStatusText').textContent = `Recorded successfully (${rec.durationSeconds}s)`;
    document.getElementById('speakingStatusText').className = 'text-xs font-semibold text-emerald-600';
  } else {
    audioPreview.classList.add('hidden');
    document.getElementById('speakingStatusText').textContent = 'Ready to record';
    document.getElementById('speakingStatusText').className = 'text-xs text-slate-500';
  }

  // Reset button state
  const recordBtn = document.getElementById('btnStartRecord');
  recordBtn.innerHTML = '🎤 Start Recording';
  recordBtn.className = 'bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center gap-2';
}

async function toggleRecording() {
  if (state.isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.mediaRecorder = new MediaRecorder(stream);
    state.recordedAudioChunks = [];
    state.recordingSecondsElapsed = 0;

    state.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) state.recordedAudioChunks.push(e.data);
    };

    state.mediaRecorder.onstop = () => {
      const blob = new Blob(state.recordedAudioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        const currentP = CEFR_EXAM_DATA.speakingPrompts[state.activeSpeakingPrompt];
        state.speakingRecordings[currentP.id] = {
          audioDataUrl: base64data,
          durationSeconds: state.recordingSecondsElapsed,
          recordedAt: new Date().toISOString()
        };
        renderSpeakingPrompt();
        updateGlobalProgress();
      };
      reader.readAsDataURL(blob);

      // Stop mic tracks
      stream.getTracks().forEach(track => track.stop());
    };

    state.mediaRecorder.start();
    state.isRecording = true;

    const recordBtn = document.getElementById('btnStartRecord');
    recordBtn.innerHTML = '⏹️ Stop Recording';
    recordBtn.className = 'bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition flex items-center gap-2 animate-pulse';

    const p = CEFR_EXAM_DATA.speakingPrompts[state.activeSpeakingPrompt];
    const statusText = document.getElementById('speakingStatusText');

    clearInterval(state.recordingTimerInterval);
    state.recordingTimerInterval = setInterval(() => {
      state.recordingSecondsElapsed++;
      statusText.textContent = `Recording: ${state.recordingSecondsElapsed}s / ${p.maxRecordingSeconds}s`;
      statusText.className = 'text-xs font-bold text-red-600';

      if (state.recordingSecondsElapsed >= p.maxRecordingSeconds) {
        stopRecording();
      }
    }, 1000);

  } catch (err) {
    console.error('Microphone error:', err);
    alert('Microphone access could not be acquired. Please ensure microphone permissions are allowed in your browser.');
  }
}

function stopRecording() {
  if (state.mediaRecorder && state.isRecording) {
    state.mediaRecorder.stop();
    state.isRecording = false;
    clearInterval(state.recordingTimerInterval);
  }
}

// ---------------- GLOBAL PROGRESS & SUBMISSION ----------------

function updateGlobalProgress() {
  const totalObj = 45; // 30 grammar + 15 listening
  const gCount = Object.values(state.grammarAnswers).filter(a => a.option !== null).length;
  const lCount = Object.values(state.listeningAnswers).filter(a => a.option !== null).length;
  const wCount = (state.writingAnswers.W1.wordCount > 30 ? 1 : 0) + (state.writingAnswers.W2.wordCount > 50 ? 1 : 0);
  const sCount = (state.speakingRecordings.S1.audioDataUrl ? 1 : 0) + (state.speakingRecordings.S2.audioDataUrl ? 1 : 0) + (state.speakingRecordings.S3.audioDataUrl ? 1 : 0);

  const totalAnswered = gCount + lCount;
  const percent = Math.round((totalAnswered / totalObj) * 100);

  const bar = document.getElementById('examProgressBar');
  if (bar) bar.style.width = `${percent}%`;

  const txt = document.getElementById('progressText');
  if (txt) txt.textContent = `Q&A: ${totalAnswered}/${totalObj} (${percent}%) | Writing: ${wCount}/2 | Speaking: ${sCount}/3`;
}

function promptSubmitExam() {
  accumulateTime();
  if (state.isRecording) stopRecording();

  const gCount = Object.values(state.grammarAnswers).filter(a => a.option !== null).length;
  const lCount = Object.values(state.listeningAnswers).filter(a => a.option !== null).length;
  const w1Words = state.writingAnswers.W1.wordCount;
  const w2Words = state.writingAnswers.W2.wordCount;

  const msg = `Exam Confirmation Summary:
- Grammar & Vocabulary: ${gCount} / 30 answered
- Listening Comprehension: ${lCount} / 15 answered
- Writing Task 1: ${w1Words} words
- Writing Task 2: ${w2Words} words
- Speaking Recordings: ${(state.speakingRecordings.S1.audioDataUrl ? 1 : 0) + (state.speakingRecordings.S2.audioDataUrl ? 1 : 0) + (state.speakingRecordings.S3.audioDataUrl ? 1 : 0)} / 3 completed

Are you ready to submit your full assessment?`;

  if (confirm(msg)) {
    finalizeExam(false);
  }
}

function finalizeExam(autoSubmitted = false) {
  clearInterval(state.timerInterval);
  accumulateTime();
  if (state.isRecording) stopRecording();
  stopTrackAudio();

  const totalDuration = Math.round((Date.now() - state.examStartTime) / 1000);

  // Compute Objective CBM Scores
  let rawGrammar = 0;
  let cbmGrammar = 0;
  const grammarDetails = [];
  const cbmBreakdown = { mastery: 0, lucky: 0, misconception: 0, gap: 0 };

  CEFR_EXAM_DATA.grammarQuestions.forEach(q => {
    const a = state.grammarAnswers[q.id];
    const isCorrect = (a.option === q.correct);
    let pts = 0;
    let status = 'unanswered';

    if (a.option) {
      if (isCorrect) {
        rawGrammar++;
        if (a.certainty === 'sure') {
          pts = CBM_SCORING_RULES.correctSure;
          status = 'mastery';
          cbmBreakdown.mastery++;
        } else {
          pts = CBM_SCORING_RULES.correctNotSure;
          status = 'lucky';
          cbmBreakdown.lucky++;
        }
      } else {
        if (a.certainty === 'sure') {
          pts = CBM_SCORING_RULES.incorrectSure;
          status = 'misconception';
          cbmBreakdown.misconception++;
        } else {
          pts = CBM_SCORING_RULES.incorrectNotSure;
          status = 'gap';
          cbmBreakdown.gap++;
        }
      }
    }
    cbmGrammar += pts;
    grammarDetails.push({
      id: q.id,
      cefr: q.cefr,
      skill: q.skill,
      studentAnswer: a.option || 'None',
      correctAnswer: q.correct,
      isCorrect,
      certainty: a.certainty || 'None',
      status,
      timeSpentSeconds: a.timeSpentSeconds
    });
  });

  // Listening Scores
  let rawListening = 0;
  let cbmListening = 0;
  const listeningDetails = [];

  CEFR_EXAM_DATA.listeningTracks.forEach(t => {
    t.questions.forEach(q => {
      const a = state.listeningAnswers[q.id];
      const isCorrect = (a.option === q.correct);
      let pts = 0;
      let status = 'unanswered';

      if (a.option) {
        if (isCorrect) {
          rawListening++;
          if (a.certainty === 'sure') {
            pts = CBM_SCORING_RULES.correctSure;
            status = 'mastery';
            cbmBreakdown.mastery++;
          } else {
            pts = CBM_SCORING_RULES.correctNotSure;
            status = 'lucky';
            cbmBreakdown.lucky++;
          }
        } else {
          if (a.certainty === 'sure') {
            pts = CBM_SCORING_RULES.incorrectSure;
            status = 'misconception';
            cbmBreakdown.misconception++;
          } else {
            pts = CBM_SCORING_RULES.incorrectNotSure;
            status = 'gap';
            cbmBreakdown.gap++;
          }
        }
      }
      cbmListening += pts;
      listeningDetails.push({
        id: q.id,
        cefr: q.cefr,
        skill: q.skill,
        studentAnswer: a.option || 'None',
        correctAnswer: q.correct,
        isCorrect,
        certainty: a.certainty || 'None',
        status,
        timeSpentSeconds: a.timeSpentSeconds
      });
    });
  });

  const totalObjectiveScore = rawGrammar + rawListening; // out of 45
  const placement = computeCefrAndIeltsPlacement(totalObjectiveScore, 45);

  const submission = {
    id: 'cefr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    candidate: state.candidate,
    date: new Date().toLocaleString(),
    autoSubmitted,
    totalDurationSeconds: totalDuration,

    // Objective modules
    grammar: { rawScore: rawGrammar, cbmScore: cbmGrammar, total: 30, details: grammarDetails },
    listening: { rawScore: rawListening, cbmScore: cbmListening, total: 15, details: listeningDetails },
    cbmBreakdown,

    // Productive modules (Awaiting AI or Manual Teacher evaluation)
    writing: {
      W1: { text: state.writingAnswers.W1.text, wordCount: state.writingAnswers.W1.wordCount, timeSpent: state.writingAnswers.W1.timeSpentSeconds },
      W2: { text: state.writingAnswers.W2.text, wordCount: state.writingAnswers.W2.wordCount, timeSpent: state.writingAnswers.W2.timeSpentSeconds },
      aiEvaluation: null, // Populated via Gemini API
      teacherScore: null,
      teacherNotes: ""
    },
    speaking: {
      S1: { audioDataUrl: state.speakingRecordings.S1.audioDataUrl, duration: state.speakingRecordings.S1.durationSeconds },
      S2: { audioDataUrl: state.speakingRecordings.S2.audioDataUrl, duration: state.speakingRecordings.S2.durationSeconds },
      S3: { audioDataUrl: state.speakingRecordings.S3.audioDataUrl, duration: state.speakingRecordings.S3.durationSeconds },
      aiEvaluation: null,
      teacherScore: null,
      teacherNotes: ""
    },

    // Overall CEFR Level estimation
    initialPlacement: placement,
    finalPlacement: placement // Can be refined once writing/speaking are graded
  };

  saveSubmission(submission);

  // Show Student Thank You Screen (NO SCORES SHOWN)
  document.getElementById('finCandidateName').textContent = state.candidate.name;
  document.getElementById('finCandidatePhone').textContent = state.candidate.phone;
  showView('finished');
}

// ---------------- GEMINI AI EVALUATION ENGINE ----------------

// ---------------- GEMINI AI AUTO-DETECTION & EVALUATION ENGINE ----------------

// Helper to extract JSON from markdown or raw text
function extractJsonFromText(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (e) {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Could not parse AI response as JSON.");
  }
}

// Dynamically discover which model works with this user's API Key
async function detectWorkingGeminiModel(apiKey) {
  // Strategy 1: Prioritize Google's recommended gemini-3.8-flash
  const probeCandidates = [
    { model: 'gemini-3.8-flash', endpoint: 'v1beta' },
    { model: 'gemini-2.0-flash', endpoint: 'v1beta' },
    { model: 'gemini-1.5-flash-latest', endpoint: 'v1beta' },
    { model: 'gemini-1.5-flash', endpoint: 'v1' },
    { model: 'gemini-pro', endpoint: 'v1' }
  ];

  for (const c of probeCandidates) {
    try {
      const testUrl = `https://generativelanguage.googleapis.com/${c.endpoint}/models/${c.model}:generateContent?key=${apiKey}`;
      const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
      });
      const data = await res.json();
      if (res.ok && data.candidates) {
        return c;
      }
    } catch (e) {
      // try next
    }
  }

  // Strategy 2: Probe listModels
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData.models && Array.isArray(listData.models)) {
        const genModels = listData.models.filter(m =>
          m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
        );
        const preferred = genModels.find(m => m.name.includes('3.8') || m.name.includes('flash')) || genModels[0];
        if (preferred) {
          const cleanName = preferred.name.replace('models/', '');
          return { model: cleanName, endpoint: 'v1beta' };
        }
      }
    }
  } catch (err) {
    console.warn('ListModels query failed', err);
  }

  // Default to gemini-3.8-flash
  return { model: 'gemini-3.8-flash', endpoint: 'v1beta' };
}

async function evaluateWritingWithGemini(submissionId) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    alert('Please enter and save your Gemini API Key in the settings section below first.');
    return;
  }

  const submissions = getSubmissions();
  const sub = submissions.find(s => s.id === submissionId);
  if (!sub) return;

  const btn = document.getElementById('btnAiEvaluateWriting');
  if (btn) btn.innerHTML = '⏳ Analyzing with Gemini AI...';

  const promptText = `
You are an expert Cambridge and IELTS Senior Examiner.
Please evaluate the following two student writing placement tasks according to official CEFR criteria (A1, A2, B1, B2, C1, C2).

--- TASK 1: Functional Email (60-90 words target) ---
Student text:
"${sub.writing.W1.text}"

--- TASK 2: Academic Discursive Essay (150-220 words target) ---
Student text:
"${sub.writing.W2.text}"

Return your evaluation strictly in pure JSON format (without markdown backticks) with this structure:
{
  "cefrLevel": "B2",
  "ieltsBandEquivalent": "6.5",
  "task1Feedback": "Concise assessment of Task 1",
  "task2Feedback": "Concise assessment of Task 2",
  "grammarAccuracy": "Detailed notes on grammar range & mistakes",
  "lexicalResource": "Detailed notes on vocabulary appropriateness",
  "coherenceCohesion": "Detailed notes on linking and organization",
  "keyWeaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "keyStrengths": ["Strength 1", "Strength 2"]
}
`;

  try {
    // Detect or load working model configuration
    let config = null;
    const savedConfig = localStorage.getItem('cefr_gemini_active_model');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // Clear deprecated 2.5 or older models
        if (!parsed.model.includes('2.5')) {
          config = parsed;
        }
      } catch (e) {}
    }
    if (!config) {
      config = await detectWorkingGeminiModel(apiKey);
      localStorage.setItem('cefr_gemini_active_model', JSON.stringify(config));
    }

    let url = `https://generativelanguage.googleapis.com/${config.endpoint}/models/${config.model}:generateContent?key=${apiKey}`;
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    let data = await response.json();

    // If model failed or was deprecated, auto-fallback to gemini-3.8-flash immediately
    if (data.error) {
      console.warn("Model response error, falling back to gemini-3.8-flash...", data.error);
      config = { model: 'gemini-3.8-flash', endpoint: 'v1beta' };
      localStorage.setItem('cefr_gemini_active_model', JSON.stringify(config));
      url = `https://generativelanguage.googleapis.com/${config.endpoint}/models/${config.model}:generateContent?key=${apiKey}`;
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });
      data = await response.json();
    }

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const rawOutput = data.candidates[0].content.parts[0].text;
      const resultJson = extractJsonFromText(rawOutput);
      sub.writing.aiEvaluation = resultJson;
      updateSubmission(sub);
      alert('✓ AI Writing Evaluation completed successfully!');
      openStudentReport(submissionId);
    } else {
      throw new Error(data.error?.message || 'Empty response from Gemini API');
    }
  } catch (err) {
    console.error('Gemini API Error:', err);
    alert('Gemini API Evaluation Error: ' + err.message);
  } finally {
    if (btn) btn.innerHTML = '🤖 Evaluate Writing with Gemini AI';
  }
}

// ---------------- ADMIN PORTAL & REPORTING ----------------

function handleAdminLogin(e) {
  e.preventDefault();
  const u = document.getElementById('adminUsernameInput').value.trim();
  const p = document.getElementById('adminPasswordInput').value.trim();
  const creds = getAdminCredentials();

  if (u === creds.username && p === creds.password) {
    document.getElementById('adminLoginModal').classList.add('hidden');
    document.getElementById('adminLoginForm').reset();
    showView('admin');
  } else {
    alert('Invalid username or password. Default is admin / admin123');
  }
}

function handleSaveDuration() {
  const val = parseInt(document.getElementById('examDurationSetting').value);
  if (isNaN(val) || val < 10 || val > 180) {
    alert('Please enter a valid exam duration between 10 and 180 minutes.');
    return;
  }
  localStorage.setItem('cefr_exam_duration', val);
  state.examDurationMinutes = val;
  alert(`Exam duration updated to ${val} minutes.`);
  initViews();
}

function handleSaveApiKey() {
  const key = document.getElementById('geminiApiKeyInput').value.trim();
  saveGeminiApiKey(key);
  // Reset cached model to force auto-detection on new key
  localStorage.removeItem('cefr_gemini_active_model');
  alert('Gemini API Key successfully saved securely on your device.');
}

async function handleTestApiKey() {
  const key = document.getElementById('geminiApiKeyInput').value.trim();
  if (!key) {
    alert('Please enter a key first.');
    return;
  }
  const testBtn = document.getElementById('testApiKeyBtn');
  testBtn.innerHTML = 'Testing...';

  try {
    const working = await detectWorkingGeminiModel(key);
    localStorage.setItem('cefr_gemini_active_model', JSON.stringify(working));
    alert(`✓ Connection Successful!\nYour API Key is valid and active.\nConnected model: ${working.model} (${working.endpoint})`);
  } catch (e) {
    alert('Connection failed: ' + e.message);
  } finally {
    testBtn.innerHTML = 'Test Connection';
  }
}

function handleChangeCreds(e) {
  e.preventDefault();
  const u = document.getElementById('newAdminUser').value.trim();
  const p = document.getElementById('newAdminPass').value.trim();
  if (!u || !p) return;
  saveAdminCredentials(u, p);
  alert('Instructor credentials updated!');
  document.getElementById('changeCredsForm').reset();
}

function renderAdminDashboard() {
  const keyInput = document.getElementById('geminiApiKeyInput');
  if (keyInput) keyInput.value = getGeminiApiKey();

  const durInput = document.getElementById('examDurationSetting');
  if (durInput) durInput.value = state.examDurationMinutes;

  const submissions = getSubmissions();
  document.getElementById('kpiTotalCandidates').textContent = submissions.length;

  if (submissions.length > 0) {
    const avgScore = Math.round(submissions.reduce((acc, s) => acc + (s.grammar.rawScore + s.listening.rawScore), 0) / submissions.length);
    document.getElementById('kpiAvgScore').textContent = `${avgScore} / 45`;
    const avgSec = Math.round(submissions.reduce((acc, s) => acc + s.totalDurationSeconds, 0) / submissions.length);
    document.getElementById('kpiAvgTime').textContent = formatSeconds(avgSec);
  }

  const tbody = document.getElementById('submissionsTableBody');
  tbody.innerHTML = '';

  if (submissions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-500">No student assessment records found yet.</td></tr>`;
    return;
  }

  submissions.forEach(sub => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100 text-sm transition';
    const totalObj = sub.grammar.rawScore + sub.listening.rawScore;
    const writingStatus = sub.writing.aiEvaluation ? '✓ Evaluated (AI)' : (sub.writing.W2.wordCount > 30 ? 'Submitted' : 'Blank');
    const speakingStatus = sub.speaking.S1.audioDataUrl ? '✓ 3 Recordings' : 'None';

    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-slate-900">${escapeHtml(sub.candidate.name)}</td>
      <td class="py-3 px-4 font-mono text-slate-600 text-xs">${escapeHtml(sub.candidate.phone)}</td>
      <td class="py-3 px-4 text-xs text-slate-500">${sub.date}</td>
      <td class="py-3 px-4 font-bold text-blue-700">${totalObj} / 45</td>
      <td class="py-3 px-4">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
          CEFR ${sub.finalPlacement.cefr} (Band ${sub.finalPlacement.ieltsBand})
        </span>
      </td>
      <td class="py-3 px-4 text-xs text-slate-600">
        <div>Writing: <span class="font-semibold text-slate-800">${writingStatus}</span></div>
        <div>Speaking: <span class="font-semibold text-slate-800">${speakingStatus}</span></div>
      </td>
      <td class="py-3 px-4 text-right space-x-2">
        <button class="btn-open-report bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition" data-id="${sub.id}">
          Open Report 📊
        </button>
        <button class="btn-del-sub text-red-500 hover:text-red-700 p-1" data-id="${sub.id}">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-open-report').forEach(b => {
    b.onclick = () => openStudentReport(b.dataset.id);
  });
  tbody.querySelectorAll('.btn-del-sub').forEach(b => {
    b.onclick = () => {
      if (confirm('Delete this candidate record?')) {
        deleteSubmission(b.dataset.id);
        renderAdminDashboard();
      }
    };
  });
}

function handleClearAll() {
  if (confirm('Permanently clear all candidate records?')) {
    clearAllSubmissions();
    renderAdminDashboard();
  }
}

// Open Diagnostic Student Modal
function openStudentReport(submissionId) {
  const submissions = getSubmissions();
  const sub = submissions.find(s => s.id === submissionId);
  if (!sub) return;

  const modal = document.getElementById('reportModal');
  modal.classList.remove('hidden');

  // Candidate
  document.getElementById('repName').textContent = sub.candidate.name;
  document.getElementById('repPhone').textContent = sub.candidate.phone;
  document.getElementById('repEmail').textContent = sub.candidate.email;
  document.getElementById('repDate').textContent = sub.date;
  document.getElementById('repTotalTime').textContent = formatSeconds(sub.totalDurationSeconds);

  // Scores
  const totalObj = sub.grammar.rawScore + sub.listening.rawScore;
  document.getElementById('repRawScore').textContent = `${totalObj} / 45`;
  document.getElementById('repCbmScore').textContent = `${sub.grammar.cbmScore + sub.listening.cbmScore > 0 ? '+' : ''}${sub.grammar.cbmScore + sub.listening.cbmScore}`;
  document.getElementById('repBand').textContent = `CEFR ${sub.finalPlacement.cefr} (IELTS Band ${sub.finalPlacement.ieltsBand})`;
  document.getElementById('repLevelName').textContent = sub.finalPlacement.name;
  document.getElementById('repRecommendation').textContent = sub.finalPlacement.course;

  // CBM Quadrants
  document.getElementById('cbmMasteryCount').textContent = sub.cbmBreakdown.mastery;
  document.getElementById('cbmLuckyCount').textContent = sub.cbmBreakdown.lucky;
  document.getElementById('cbmMisconceptionCount').textContent = sub.cbmBreakdown.misconception;
  document.getElementById('cbmGapCount').textContent = sub.cbmBreakdown.gap;

  // Writing Texts
  document.getElementById('repW1Text').innerText = sub.writing.W1.text || '(No text submitted)';
  document.getElementById('repW1Count').textContent = `${sub.writing.W1.wordCount} Words (${formatSeconds(sub.writing.W1.timeSpent)})`;

  document.getElementById('repW2Text').innerText = sub.writing.W2.text || '(No text submitted)';
  document.getElementById('repW2Count').textContent = `${sub.writing.W2.wordCount} Words (${formatSeconds(sub.writing.W2.timeSpent)})`;

  // AI Evaluation Display
  const aiBox = document.getElementById('repAiEvaluationBox');
  if (sub.writing.aiEvaluation) {
    aiBox.classList.remove('hidden');
    const ai = sub.writing.aiEvaluation;
    document.getElementById('aiCefrBadge').textContent = `AI Estimated: CEFR ${ai.cefrLevel} (Band ${ai.ieltsBandEquivalent})`;
    document.getElementById('aiGrammarNotes').textContent = ai.grammarAccuracy;
    document.getElementById('aiLexicalNotes').textContent = ai.lexicalResource;
    document.getElementById('aiCoherenceNotes').textContent = ai.coherenceCohesion;
    document.getElementById('aiWeaknessesList').innerHTML = ai.keyWeaknesses.map(w => `<li>• ${escapeHtml(w)}</li>`).join('');
  } else {
    aiBox.classList.add('hidden');
  }

  // AI Evaluate Button
  document.getElementById('btnAiEvaluateWriting').onclick = () => {
    evaluateWritingWithGemini(sub.id);
  };

  // Speaking Recordings
  ['S1', 'S2', 'S3'].forEach(promptId => {
    const audioEl = document.getElementById(`repAudio_${promptId}`);
    const rec = sub.speaking[promptId];
    if (rec && rec.audioDataUrl) {
      audioEl.src = rec.audioDataUrl;
      audioEl.classList.remove('hidden');
      document.getElementById(`repAudioDesc_${promptId}`).textContent = `Recorded: ${rec.duration}s`;
    } else {
      audioEl.classList.add('hidden');
      document.getElementById(`repAudioDesc_${promptId}`).textContent = 'Not recorded';
    }
  });

  // Manual Rubric Controls
  const teacherCefrSelect = document.getElementById('teacherCefrSelect');
  teacherCefrSelect.value = sub.finalPlacement.cefr;
  document.getElementById('teacherNotesInput').value = sub.writing.teacherNotes || '';

  document.getElementById('btnSaveManualGrade').onclick = () => {
    const chosenCefr = teacherCefrSelect.value;
    const notes = document.getElementById('teacherNotesInput').value;
    sub.finalPlacement.cefr = chosenCefr;
    sub.writing.teacherNotes = notes;
    updateSubmission(sub);
    alert('Evaluation saved successfully!');
    openStudentReport(sub.id);
  };

  // Audit Table (Items 1 to 45)
  const auditTbody = document.getElementById('reportAuditTableBody');
  auditTbody.innerHTML = '';
  const allObj = [...sub.grammar.details, ...sub.listening.details];

  allObj.forEach(qd => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-slate-100 text-xs hover:bg-slate-50';
    tr.innerHTML = `
      <td class="py-2 px-3 font-bold text-slate-900">Q${qd.id}</td>
      <td class="py-2 px-3 text-slate-500">${qd.cefr}</td>
      <td class="py-2 px-3 text-slate-700">${escapeHtml(qd.skill)}</td>
      <td class="py-2 px-3 font-mono font-bold ${qd.isCorrect ? 'text-emerald-700' : 'text-red-600'}">${qd.studentAnswer}</td>
      <td class="py-2 px-3 font-mono font-bold text-blue-700">${qd.correctAnswer}</td>
      <td class="py-2 px-3">${qd.certainty}</td>
      <td class="py-2 px-3 font-semibold ${qd.status === 'misconception' ? 'text-red-600' : 'text-slate-800'}">${qd.status}</td>
      <td class="py-2 px-3 font-mono text-slate-700">${qd.timeSpentSeconds}s</td>
    `;
    auditTbody.appendChild(tr);
  });

  // Modal actions
  document.getElementById('closeReportModalBtn').onclick = () => modal.classList.add('hidden');
  document.getElementById('printReportBtn').onclick = () => window.print();
  document.getElementById('downloadStudentCsvBtn').onclick = () => exportSingleStudentCsv(sub);
}

// Export CSVs
function exportAllToCsv() {
  const submissions = getSubmissions();
  if (submissions.length === 0) return alert('No records to export.');

  let csv = 'ID,Name,Phone,Date,Duration(s),Grammar(/30),Listening(/15),TotalObj(/45),CEFR,IELTS Band,CBM Mastery,CBM Lucky,CBM Misconceptions,CBM Gaps\n';
  submissions.forEach(s => {
    csv += `"${s.id}","${s.candidate.name}","${s.candidate.phone}","${s.date}",${s.totalDurationSeconds},${s.grammar.rawScore},${s.listening.rawScore},${s.grammar.rawScore + s.listening.rawScore},"${s.finalPlacement.cefr}","${s.finalPlacement.ieltsBand}",${s.cbmBreakdown.mastery},${s.cbmBreakdown.lucky},${s.cbmBreakdown.misconception},${s.cbmBreakdown.gap}\n`;
  });
  downloadCsv(csv, `CEFR_Placement_All_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
}

function exportSingleStudentCsv(sub) {
  let csv = `CEFR Diagnostic Assessment Report\n`;
  csv += `Name:,"${sub.candidate.name}"\nPhone:,"${sub.candidate.phone}"\nDate:,"${sub.date}"\n`;
  csv += `Final Placement:,"CEFR ${sub.finalPlacement.cefr} (IELTS Band ${sub.finalPlacement.ieltsBand})"\n`;
  csv += `Total Objective Score:,"${sub.grammar.rawScore + sub.listening.rawScore} / 45"\n\n`;

  csv += `Question #,CEFR,Skill,Student Choice,Key,Certainty,Status,Time(s)\n`;
  [...sub.grammar.details, ...sub.listening.details].forEach(q => {
    csv += `${q.id},"${q.cefr}","${q.skill}","${q.studentAnswer}","${q.correctAnswer}","${q.certainty}","${q.status}",${q.timeSpentSeconds}\n`;
  });
  downloadCsv(csv, `Report_${sub.candidate.name.replace(/\s+/g, '_')}.csv`);
}

function downloadCsv(content, filename) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function formatSeconds(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}
