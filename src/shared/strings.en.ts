/**
 * English Strings & Templates for Cyculus (matching STRINGS_HI shape)
 */

export const STRINGS_EN = {
  // Navigation & Shell
  nav: {
    logTab: 'Log',
    cycleTab: 'Cycle',
    briefTab: 'Brief',
    ooflogSub: 'aaj kaisa raha',
    cycleSub: 'cycle timeline',
    briefSub: 'clinical chitthi',
    settingsTitle: 'Settings & Privacy',
    settingsSub: '100% On-Device',
    onDeviceBadge: '100% On-Device',
    tagline: 'Making health make sense.',
    sidebarPromise: 'Your health. Your questions. Our priority.',
    sidebarZeroCloud: '100% on-device · Zero cloud',
    offlinePwa: 'Offline Ready PWA',
  },

  // Global Toasts & Status
  toasts: {
    baselineSaved: 'Initial cycle baseline saved! Now log your first day.',
    firstDayWelcome: 'Welcome! Tell us about today to start your diary.',
    entrySaved: 'Daily health entry saved securely!',
    demoLoaded: (name: string) => `Loaded 6 months of demo data for ${name}!`,
    demoRemoved: 'Demo data removed. Returned to clean, private diary.',
    setupCleared: 'Initial cycle baseline cleared.',
    allCleared: 'All data cleared successfully.',
  },

  // Daily Logging (OofLog)
  ooflog: {
    title: 'OofLog',
    badge: 'aaj kaisa raha',
    tagline: "Log today's flow, symptoms, pain, and mood in 1-tap or your own voice",
    inputPrompt: 'Tell me about today, in your own words:',
    inputPlaceholder: 'e.g. "Cramps started yesterday, flow is heavy and feeling low..."',
    voiceHint: 'Voice check-in',
    tryPillsLabel: 'Try:',
    tryPill1: 'kal se pet mein bohot dard hai...',
    tryPill2: 'light spotting and mild backache',
    listening: 'Listening... speak naturally',
    voiceError: 'Voice recognition error. Please type your entry.',

    // 1-Tap Quick Sections
    sectionFlow: '1. BLEEDING FLOW',
    sectionPain: '2. PAIN SCALE (0–10)',
    painZero: 'None',
    painMild: 'Mild',
    painModerate: 'Moderate',
    painSevere: 'Severe',
    sectionSymptoms: '3. PHYSICAL SYMPTOMS',
    sectionMood: '4. MOOD',
    sectionNotes: '5. PERSONAL NOTES (OPTIONAL)',
    notesPlaceholder: 'Meds taken, sleep, exercise, feeling...',
    saveButton: 'Save Today’s Check-In',
    savingButton: 'Saving...',
    alreadyLoggedToday: 'Saved for today (tap to edit)',

    // Confirm Card
    confirmTitle: 'This is what I understood.',
    confirmSubtitle: "Change anything that's wrong, then save.",
    trustNote: '100% on-device IndexedDB · Never sent to any cloud',
    confirmSaveButton: 'Yes, save this entry',
    confirmEditButton: 'Edit',
    confirmCancelButton: 'Cancel',
  },

  // Urgent Red Flag Banner
  urgent: {
    bannerTitle: 'Urgent Medical Attention Advised',
    contactEmergency: 'Please seek prompt in-person medical care or contact emergency services immediately.',
    callNotice: 'This app is not a replacement for emergency care.',
  },

  // Cycle Timeline & Predictions (Dayum)
  dayum: {
    title: 'Dayum',
    badge: 'cycle timeline',
    tagline: 'Longitudinal cycle history and calibrated statistical prediction window',

    // Primary Prediction Headline & Card
    predictionReadyHeadline: (daysUntil: number, rangeStr: string) =>
      daysUntil === 0
        ? `Period predicted today (${rangeStr})`
        : daysUntil > 0
        ? `Next period expected in ~${daysUntil} days (${rangeStr})`
        : `Expected window passed ${Math.abs(daysUntil)} days ago (${rangeStr})`,

    predictionEarlyHeadline: 'Next period prediction is calibrating',
    predictionEarlyBody:
      'An empty chart tells you nothing. When your next period arrives and completes your first full cycle, your personalized statistical prediction window (~80% coverage) will activate here.',

    basedOnCycles: (count: number) => `Based on ${count} cycles`,
    whyAmISeeingThis: 'Why am I seeing this? (Statistical bounds) →',
    predictionWindowCoverage: '~80% confidence window',

    // Calendar & Timeline
    calendarTitle: 'Cycle Calendar & Timeline',
    calendarHeadline: (monthYear: string, periodDays: number, totalDays: number) =>
      `${periodDays} bleeding days and ${totalDays} total entries logged in ${monthYear}.`,
    legendPeriod: 'Period flow',
    legendWindow: 'Predicted window',
    legendSymptom: 'Symptom',

    // Cycle Length Trends
    trendTitle: 'Cycle Length Trends',
    trendHeadline: (cyclesCount: number, min: number, max: number) =>
      `Your last ${cyclesCount} cycles ranged from ${min} to ${max} days.`,
    trendHeadlineSingle: (days: number) =>
      `Your last completed cycle was ${days} days.`,
    trendEmpty:
      'An empty chart tells you nothing. After completing 2–3 cycles, your variation trend line will appear here against FIGO clinical thresholds.',
    normalRangeNote: 'Normal clinical range: 24 to 38 days (FIGO standard)',

    // Symptom Patterns
    symptomTitle: 'Symptoms by Cycle Phase',
    symptomHeadline: (symptomName: string, days: number, phase: string) =>
      `${symptomName} was your most frequent symptom (${days} days), predominantly during ${phase}.`,
    symptomHeadlineGeneric: (count: number) =>
      `Showing patterns across ${count} tracked symptoms.`,
    symptomEmpty: 'Log symptoms to visualize which phase of your cycle triggers specific discomforts.',
    phasePeriod: 'Period',
    phasePostPeriod: 'Post-period',
    phaseMidCycle: 'Mid-cycle',
    phasePrePeriod: 'Pre-period',
    phaseDisclaimer: 'Cycle phases are relative estimates based on recorded period starts. This is not an ovulation test.',

    // History
    historyTitle: 'Recent Cycle History',
    historyHeadline: (count: number) => `History of intervals and bleeding days across ${count} cycles`,
    currentCycleOngoing: 'Current cycle (ongoing)',
    cycleDaysCount: (length: number, bleedDays: number) => `${length}-day cycle · ${bleedDays} bleeding days`,
    ongoingCycleBleed: (bleedDays: number) => `${bleedDays} bleeding days logged`,

    // Algorithm Explainer Modal
    whyModalTitle: 'How does this prediction work?',
    whyModalSub: 'Transparent, evidence-based prediction model (FIGO & Utah Hive)',
    whyPoint1Title: 'No fake certainty',
    whyPoint1Text: 'We show an 80% statistical coverage window rather than a single guessing date. Menstrual biology naturally varies.',
    whyPoint2Title: 'Adapts to your real body',
    whyPoint2Text: 'We start with a clinical prior and smoothly transition to your personal empirical distribution after 3 completed cycles.',
    whyPoint3Title: '100% on-device private',
    whyPoint3Text: 'All mathematical calculations happen right in your browser. Nothing is ever sent to a remote server.',
  },

  // Doctor Brief (Chitthi)
  brief: {
    title: 'Doctor Brief',
    badge: 'clinical chitthi',
    subtitle: '1-page consultation brief formatted with FIGO thresholds & cited guidelines',
    printButton: 'Print / Save as PDF',
    printHeaderTitle: 'Clinical Menstrual Health Summary (Doctor Brief)',
    verifiedBadge: '100% On-Device · FIGO Verified',

    // Empty state
    emptyTitle: 'No entries yet',
    emptyBody: 'Tell us about today, and your pattern will appear here after a few cycles.',
    emptyAction: 'Tell us about today',
    emptyPreviewTitle: 'An empty chart tells the doctor nothing. Here is what your brief will include:',
    previewPoint1Title: '1. FIGO Metrics',
    previewPoint1Body: 'Average cycle duration, variance, and bleeding duration stats.',
    previewPoint2Title: '2. Clinical Flags',
    previewPoint2Body: 'NICE/ACOG cited flags for heavy bleeding or dysmenorrhea.',
    previewPoint3Title: '3. Doctor Questions',
    previewPoint3Body: 'Targeted consultation questions customized to your symptoms.',

    // Full Sentence Brief Templates
    summaryFull: (cycles: number, avgDays: number) =>
      `Based on ${cycles} completed cycles, your average cycle length is ${avgDays} days.`,
    earlyPictureNote: 'This is based on only one or two cycles, so it is an early picture.',
    flagsFoundNote: (count: number) =>
      `${count} point(s) are worth discussing with a doctor.`,
    noFlagsNote: 'No points were flagged for discussion in this period.',
    notEnoughData: 'Not enough data yet. Keep logging to see your cycle pattern.',

    // Metrics list
    cycleCountLabel: 'Cycles used',
    avgLengthLabel: 'Average cycle length',
    rangeLabel: 'Shortest to longest',
    avgBleedingLabel: 'Average bleeding days',
    latestCycleLabel: 'Latest completed cycle',
    daysUnit: 'days',

    symptomsSection: 'Symptoms',
    flagsSection: 'Worth discussing with a doctor',
    questionsSection: 'Questions to ask your doctor',
    sourcesLabel: 'Sources: ',
    disclaimer:
      'This app is not a medical device and does not replace a doctor. It does not diagnose.',
  },

  // Onboarding Modal (First Minute)
  onboarding: {
    badge: 'Cyculus · 100% On-Device',
    welcomeTitle: 'Welcome to Cyculus',
    welcomeSubtitle: 'Your private, phone-first cycle diary & doctor-ready brief',

    // Step 1 Guarantees
    card1Title: '100% On-Device PWA (No Profile Needed)',
    card1Body: 'No account, profile, or name required. Everything stays locally in your browser IndexedDB with offline caching.',
    card2Title: 'Facts ready for your clinician',
    card2Body: 'Log symptoms in your own words. Generate a clear 1-page PDF for medical appointments.',
    card3Title: 'Non-Diagnostic Wellness Tool',
    card3Body: 'Cyculus evaluates clinical standards (FIGO/ACOG) to help you discuss patterns with your doctor.',

    nextSetupButton: 'Next: Set Up Cycle Prior →',
    skipToFirstDayButton: 'Skip to: Log your first day →',

    // Step 2 Prior Calibration
    step2Badge: 'Step 2 · Initial Prior Setup',
    step2Pill: 'Self-Reported Prior',
    step2Title: 'Calibrate Your Cycle Prior',
    step2Body: 'This self-reported prior seeds early predictions, fading as real logs accumulate. It never triggers clinical flags.',

    lastPeriodLabel: 'When did your last period start?',
    optionalTag: 'Optional',
    cycleLengthLabel: 'Typical Cycle Length',
    mythNotice: '28 is a myth',
    modeKnow: 'I know my cycle',
    modeNotSure: 'Not sure / Irregular',
    quickSelectLabel: 'Quick select typical days:',
    adjustDaysLabel: 'Adjust exact days:',
    daysSuffix: 'days',
    normalRangeHint: 'Normal clinical range is 24–38 days (FIGO standard).',
    populationFallbackTitle: 'Population Average Fallback',
    populationFallbackBody: 'No problem! Cyculus will use the clinical population average (29.3 days) with a wide prediction window until your own logs build up.',

    earlierDatesTitle: 'Earlier Period Dates (Improve Accuracy)',
    earlierDatesHint: '2 or 3 earlier start dates provide real observed intervals rather than a rough estimate.',
    addDatesToggle: '+ Add Dates',
    hideDatesToggle: 'Hide',

    backButton: 'Back',
    logFirstDayButton: 'Log your first day',
    saveBaselineButton: 'Save Baseline',
  },

  // Settings & Privacy
  settings: {
    title: 'Settings & Privacy',
    subtitle: 'Your health data, completely under your control — 100% on-device.',

    // Baseline Card
    baselineBadge: 'Baseline Setup',
    baselineTitle: 'Cycle Baseline Setup',
    baselineBody: 'Seeds early predictions with your self-reported baseline until enough real cycles are logged.',
    changeBaselineButton: 'Edit Baseline',
    removeBaselineButton: 'Remove Baseline',
    lastPeriodField: 'Last Period Start',
    notLoggedField: 'Not logged',
    cyclePriorField: 'Cycle Prior',
    earlierDatesField: 'Earlier Period Dates',
    noneField: 'None',

    // Zero-Cloud Guarantee
    zeroCloudTitle: 'Zero-Cloud Guarantee (100% On-Device)',
    zeroCloudBody: 'No telemetry, zero cloud database. All logs are stored strictly inside your browser’s IndexedDB sandbox.',
    loggedDaysCount: (count: number) => `${count} real logged days in this browser`,

    // PWA Guide
    pwaTitle: 'PWA Installation & Offline Guide',
    pwaSubtitle: 'Add to home screen to use anywhere without internet',
    offlineReadyBadge: 'Offline Ready',
    iosStep: 'In Safari tap Share (⎋) → Choose "Add to Home Screen".',
    androidStep: 'In Chrome tap menu (⋮) → Choose "Install app".',
    desktopStep: 'Click the install icon (⊕) in the browser address bar.',

    // Developer / Seed Tool (Secondary)
    demoBadge: 'Demonstration Tool',
    demoTitle: 'Clinical Evaluation & Demo Personas',
    demoSubtitle: 'Pre-loaded 6-month synthetic longitudinal datasets for evaluator testing.',
    openDemoButton: 'Open Demo Tool',
    closeDemoButton: 'Close',
    demoWarning: 'Loading demo data lets you test features without losing your own diary data.',
    removeDemoDataButton: 'Remove Demo Data',

    // Data Management
    dataSectionTitle: 'Data Management',
    exportTitle: 'Export Diary (JSON Backup)',
    exportBody: 'Download an unencrypted raw JSON copy of all your local logs for personal backup.',
    exportButton: 'Download JSON',
    clearTitle: 'Clear All Data',
    clearBody: 'Permanently purge all logs and baseline preferences from this device.',
    clearButton: 'Clear All Data',

    // Confirmation Modal for Clear All
    clearConfirmTitle: 'Permanently Clear All Local Data?',
    clearConfirmBody: 'This action is irreversible. All your logs, notes, and cycle baseline will be deleted from this device.',
    clearConfirmYes: 'Yes, permanently delete',
    clearConfirmCancel: 'Cancel',

    // Medical References
    referencesTitle: 'Clinical Sources & References',
  },

  // Confirm Seed Modal
  seedModal: {
    badge: 'Seed Demo Data',
    title: 'Load Demonstration Persona?',
    confirmButton: 'Load Persona',
    cancelButton: 'Cancel',
  },
} as const;
