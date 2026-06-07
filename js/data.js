/**
 * SpineIQ — Data Model v2.0
 * Extended with SSS clinical scoring fields:
 *   - cl: clinical assessment (radiculopathy grade)
 *   - od: ODI disability scores
 *   - rf: red flag screening
 */

const D = {
  p:  { name:'', age:'', gender:'', height:'', weight:'', bmi:'' },
  oc: { type:'', other:'' },
  wp: { sitting:0, standing:0, driving:0, lifting:'none' },
  ls: { sleep:7, sleepQ:'fair', walking:30, steps:5000, exFreq:'none', exType:'', activeMin:30 },
  hd: { src:'manual', steps:'', walkMin:'', exMin:'', activeMin:'', sedentary:'', sleepDur:'', rhr:'', weight:'' },
  pa: { loc:'', intensity:5, duration:'', pattern:'', triggers:'', radiation:'no', limitations:'' },
  fn: { sit:'normal', stand:'normal', walk:'normal', stairs:'normal', lift:'normal' },
  // SSS Clinical fields
  cl: { radiculopathy: 0 },   // Leg radiculopathy grade 0–3
  od: { walking:'normal', sitting:'normal', standing:'normal', sleep:'normal', daily:'normal' }, // ODI disability
  rf: {                        // Red flag screening
    cancer: false,
    weightLoss: false,
    fever: false,
    trauma: false,
    bowelBladder: false,
    saddleAnesthesia: false,
    neurologicDeficit: false,
    otherPathology: false,
  }
};

function resetData() {
  Object.assign(D, {
    p:  { name:'', age:'', gender:'', height:'', weight:'', bmi:'' },
    oc: { type:'', other:'' },
    wp: { sitting:0, standing:0, driving:0, lifting:'none' },
    ls: { sleep:7, sleepQ:'fair', walking:30, steps:5000, exFreq:'none', exType:'', activeMin:30 },
    hd: { src:'manual', steps:'', walkMin:'', exMin:'', activeMin:'', sedentary:'', sleepDur:'', rhr:'', weight:'' },
    pa: { loc:'', intensity:5, duration:'', pattern:'', triggers:'', radiation:'no', limitations:'' },
    fn: { sit:'normal', stand:'normal', walk:'normal', stairs:'normal', lift:'normal' },
    cl: { radiculopathy: 0 },
    od: { walking:'normal', sitting:'normal', standing:'normal', sleep:'normal', daily:'normal' },
    rf: { cancer:false, weightLoss:false, fever:false, trauma:false, bowelBladder:false, saddleAnesthesia:false, neurologicDeficit:false, otherPathology:false }
  });
}
