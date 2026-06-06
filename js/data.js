/**
 * SpineIQ — Data Model
 * Central state object for the assessment session.
 * All sections are keyed by their assessment domain.
 */

const D = {
  // Patient demographics
  p: {
    name: '', age: '', gender: '',
    height: '', weight: '', bmi: ''
  },

  // Occupation
  oc: {
    type: '', other: ''
  },

  // Work patterns
  wp: {
    sitting: 0, standing: 0, driving: 0,
    lifting: 'none'
  },

  // Lifestyle
  ls: {
    sleep: 7, sleepQ: 'fair',
    walking: 30, steps: 5000,
    exFreq: 'none', exType: '',
    activeMin: 30
  },

  // Health / wearable data
  hd: {
    src: 'manual',
    steps: '', walkMin: '', exMin: '', activeMin: '',
    sedentary: '', sleepDur: '', rhr: '', weight: ''
  },

  // Pain assessment
  pa: {
    loc: '', intensity: 5,
    duration: '', pattern: '',
    triggers: '', radiation: 'no',
    limitations: ''
  },

  // Functional status
  fn: {
    sit: 'normal', stand: 'normal', walk: 'normal',
    stairs: 'normal', lift: 'normal'
  }
};

/** Utility: calculate BMI from height (cm) and weight (kg) */
function calcBMI(h, w) {
  h = parseFloat(h); w = parseFloat(w);
  if (!h || !w) return '';
  return (w / ((h / 100) ** 2)).toFixed(1);
}

/** Utility: return plain-language BMI classification */
function bmiLbl(v) {
  v = parseFloat(v);
  if (!v)     return '';
  if (v < 18.5) return 'Underweight';
  if (v < 25)   return 'Normal';
  if (v < 30)   return 'Overweight';
  if (v < 35)   return 'Obese I';
  return 'Obese II+';
}

/** Utility: return CSS colour variable for BMI value */
function bmiCol(v) {
  v = parseFloat(v);
  if (!v)     return 'var(--text2)';
  if (v < 25)  return 'var(--green)';
  if (v < 30)  return 'var(--amber)';
  return 'var(--red)';
}

/** Reset all data to initial state */
function resetData() {
  Object.assign(D, {
    p:  { name:'', age:'', gender:'', height:'', weight:'', bmi:'' },
    oc: { type:'', other:'' },
    wp: { sitting:0, standing:0, driving:0, lifting:'none' },
    ls: { sleep:7, sleepQ:'fair', walking:30, steps:5000, exFreq:'none', exType:'', activeMin:30 },
    hd: { src:'manual', steps:'', walkMin:'', exMin:'', activeMin:'', sedentary:'', sleepDur:'', rhr:'', weight:'' },
    pa: { loc:'', intensity:5, duration:'', pattern:'', triggers:'', radiation:'no', limitations:'' },
    fn: { sit:'normal', stand:'normal', walk:'normal', stairs:'normal', lift:'normal' }
  });
}
