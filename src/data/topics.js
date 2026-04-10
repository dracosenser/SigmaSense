// src/data/topics.js
// All UIL Number Sense topics from Heath NS Tricks PDF
// Each topic: id, name, cat, catLabel, diff, target(ms), baseK, hint, lessonKey, gen()

function r(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(a){return a[r(0,a.length-1)]}
function gcd(a,b){return b===0?a:gcd(b,a%b)}

// ── Generators ───────────────────────────────────────────────────────────────
function genMult2x2(){const a=r(12,99),b=r(12,99);return{q:`${a} × ${b} =`,a:a*b}}
function genMult11(){
  const f=[
    ()=>{const a=r(12,999);return{q:`${a} × 11 =`,a:a*11}},
    ()=>{const a=r(12,99)*11;return{q:`${a} ÷ 11 =`,a:a/11}},
    ()=>{const a=r(100,999);return{q:`${a} × 111 =`,a:a*111}},
  ];return pick(f)()
}
function genMult101(){const a=r(12,999);return{q:`${a} × 101 =`,a:a*101}}
function genMult25(){
  const f=[
    ()=>{const a=r(2,40)*4;return{q:`${a} × 25 =`,a:a*25}},
    ()=>{const a=r(2,40)*4;return{q:`${a} ÷ 25 =`,a:a/25}},
  ];return pick(f)()
}
function genMult75(){const a=r(2,20)*4;return{q:`${a} × 75 =`,a:a*75}}
function genNear100(){
  if(r(0,1)){const a=r(91,109),b=r(91,109);return{q:`${a} × ${b} =`,a:a*b}}
  const a=r(991,1009),b=r(991,1009);return{q:`${a} × ${b} =`,a:a*b}
}
function genSqEnds5(){const a=pick([15,25,35,45,55,65,75,85,95,105,115]);return{q:`${a}² =`,a:a*a}}
function genSq5059(){const a=r(41,69);return{q:`${a}² =`,a:a*a}}
function genEquidist(){
  const mid=pick([25,35,45,55,65,75,85,95]);const d=pick([1,2,3,4,5]);
  return{q:`${mid-d} × ${mid+d} =`,a:(mid-d)*(mid+d)}
}
function genReverses(){
  const a=r(1,9),b=r(1,9);if(a===b)return genReverses();
  return{q:`${a*10+b} × ${b*10+a} =`,a:(a*10+b)*(b*10+a)}
}
function genDoubleHalf(){
  const a=pick([15,25,35,14,16,18,24,26]);const b=r(11,99);return{q:`${a} × ${b} =`,a:a*b}
}
function genBothEnd5(){
  const a=pick([15,25,35,45,55,65,75,85,95]);const b=pick([15,25,35,45,55,65,75,85,95]);
  return{q:`${a} × ${b} =`,a:a*b}
}
function genMixedNums(){
  const n=r(3,12);const d=pick([3,4,5,6,7,8]);const p=r(1,d-1);const q2=d-p;
  const num=n*(n+1)*(d*d)+(p*q2);const den=d*d;const g=gcd(num,den);
  const ans=den/g===1?String(num/g):`${num/g}/${den/g}`;
  return{q:`${n} ${p}/${d} × ${n} ${q2}/${d} =`,a:ans}
}
function genDiffSquares(){
  const a=r(10,99),d=pick([1,2,3,4,5]);const b=a+d;
  return r(0,1)?{q:`${b}² − ${a}² =`,a:b*b-a*a}:{q:`${a}² − ${b}² =`,a:a*a-b*b}
}
function genSumSquares(){
  const pairs=[[72,13],[82,12],[93,21],[45,46],[55,56],[36,57],[37,67],[62,48],[92,31],[83,22]];
  const [a,b]=pick(pairs);return{q:`${a}² + ${b}² =`,a:a*a+b*b}
}
function genConsecSq(){const a=pick([12,15,20,25,30,35,40,45]);return{q:`${a}² + ${a+1}² =`,a:a*a+(a+1)*(a+1)}}
function genFactoring(){
  const k=r(2,15),a=r(2,9),b=r(2,9);return{q:`${k*a} + ${k*b} =`,a:k*(a+b)}
}
function genRem4(){const n=r(1000,99999);return{q:`${n} ÷ 4, remainder =`,a:n%4}}
function genRem9(){const n=r(1000,99999);const d=r(0,1)?9:3;return{q:`${n} ÷ ${d}, remainder =`,a:n%d}}
function genRem11(){const n=r(1000,99999);return{q:`${n} ÷ 11, remainder =`,a:n%11}}
function genRemExpr(){
  const a=r(10,50),b=r(2,9),c=r(2,9);const d=pick([3,4,6,7,8,9]);
  return{q:`(${a}×${b}+${c}) ÷ ${d}, remainder =`,a:((a*b+c)%d+d)%d}
}
function genDiv9(){const a=r(11,99)*9;return{q:`${a} ÷ 9 =`,a:a/9}}
function genSquares(){const a=r(1,30);return{q:`${a}² =`,a:a*a}}
function genCubes(){const a=r(1,15);return{q:`${a}³ =`,a:a*a*a}}
function genPowers(){
  const opts=[[2,r(1,12)],[3,r(1,7)],[5,r(1,5)]];const [b,e]=pick(opts);
  return{q:`${b}^${e} =`,a:Math.pow(b,e)}
}
const FRACS=[[1,7,'0.142857'],[2,7,'0.285714'],[3,7,'0.428571'],[4,7,'0.571428'],
  [1,9,'0.111…'],[1,11,'0.0909…'],[1,6,'0.1666…'],[5,6,'0.8333…'],
  [1,8,'0.125'],[3,8,'0.375'],[5,8,'0.625'],[7,8,'0.875'],[1,12,'0.0833…']]
function genFracs(){const [n,d,dec]=pick(FRACS);return{q:`${n}/${d} as decimal =`,a:dec}}
function genSeries(){
  const n=r(5,20);const t=r(0,2);
  if(t===0)return{q:`1+2+…+${n} =`,a:n*(n+1)/2}
  if(t===1)return{q:`1²+2²+…+${n}² =`,a:n*(n+1)*(2*n+1)/6}
  const s=n*(n+1)/2;return{q:`1³+2³+…+${n}³ =`,a:s*s}
}
const FIB=[1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584]
function genFibonacci(){const i=r(2,14);return{q:`Fibonacci F(${i+1}) =`,a:FIB[i]}}
function genFibSums(){const n=r(4,10);return{q:`Sum of first ${n} Fibonacci terms =`,a:FIB.slice(0,n).reduce((a,b)=>a+b,0)}}
function genFibProps(){
  const n=r(1,8);const s=FIB.slice(n-1,n+9).reduce((a,b)=>a+b,0);
  return{q:`Sum of F(${n}) through F(${n+9}) =`,a:s}
}
function genDivisors(){
  const n=r(2,100);let c=0;for(let i=1;i<=n;i++)if(n%i===0)c++;
  return{q:`Number of divisors of ${n} =`,a:c}
}
const TRIG_D=[['sin(30°)','1/2'],['sin(45°)','√2/2'],['sin(60°)','√3/2'],
  ['cos(30°)','√3/2'],['cos(45°)','√2/2'],['cos(60°)','1/2'],
  ['tan(45°)','1'],['tan(30°)','√3/3'],['tan(60°)','√3'],
  ['sin(0°)','0'],['cos(0°)','1'],['sin(90°)','1'],['cos(90°)','0']]
function genTrig(){const [q,a]=pick(TRIG_D);return{q:`${q} =`,a}}
function genCombPerm(){
  const n=r(4,10),r2=r(2,Math.min(n,5));
  if(r(0,1)){let p=1;for(let i=n;i>n-r2;i--)p*=i;return{q:`P(${n},${r2}) =`,a:p}}
  let p=1;for(let i=n;i>n-r2;i--)p*=i;let f=1;for(let i=1;i<=r2;i++)f*=i;
  return{q:`C(${n},${r2}) =`,a:p/f}
}
function genGCDLCM(){
  const a=r(2,30)*pick([2,3,4,5]),b=r(2,30)*pick([2,3,4,5]),g=gcd(a,b);
  return r(0,1)?{q:`GCD(${a},${b}) =`,a:g}:{q:`LCM(${a},${b}) =`,a:a*b/g}
}
function genBases(){
  const t=r(0,2);
  if(t===0){const n=r(5,255);return{q:`${n}₁₀ in base 2 =`,a:n.toString(2)}}
  if(t===1){const n=r(5,255);return{q:`${n}₁₀ in base 8 =`,a:n.toString(8)}}
  const n=r(5,255);return{q:`${n}₁₀ in base 16 =`,a:n.toString(16).toUpperCase()}
}
function genRepDec(){
  const t=r(0,2);
  if(t===0){const a=r(1,8);return{q:`.${a}${a}${a}… as fraction =`,a:`${a}/9`}}
  if(t===1){const ab=r(10,98);return{q:`.${Math.floor(ab/10)}${ab%10}${Math.floor(ab/10)}${ab%10}… =`,a:`${ab}/99`}}
  const a=r(1,9),b=r(1,9);return{q:`.${a}${b}${b}${b}… =`,a:`${a*9+b}/90`}
}
function genModular(){
  const a=r(2,20),m=r(2,12),e=r(2,8);
  return{q:`${a}^${e} mod ${m} =`,a:((Math.pow(a,e)%m)+m)%m}
}
function genFactorial(){const n=r(3,10);let f=1;for(let i=1;i<=n;i++)f*=i;return{q:`${n}! =`,a:f}}
function genSqroots(){const n=r(1,20);return{q:`√${n*n} =`,a:n}}
function genLimits(){const a=r(1,10);return{q:`lim(x→${a}) (x²−${a*a})/(x−${a}) =`,a:2*a}}
function genDerivs(){
  const n=r(2,8),c=r(1,9),x=r(1,5);const t=r(0,2);
  if(t===0)return{q:`d/dx[${c}x^${n}] at x=1 =`,a:c*n}
  if(t===1)return{q:`d/dx[x^${n}] at x=${x} =`,a:n*Math.pow(x,n-1)}
  return{q:`d/dx[${c}x² + ${n}x] at x=${x} =`,a:2*c*x+n}
}
function genIntegrals(){
  const n=r(1,4),b=r(2,6);
  const val=Math.pow(b,n+1)/(n+1);
  if(Number.isInteger(val))return{q:`∫₀^${b} x^${n} dx =`,a:val}
  return{q:`∫₀^${b} x dx =`,a:b*b/2}
}
function genLogs(){
  const base=pick([2,3,10]);const exp=r(1,6);return{q:`log_${base}(${Math.pow(base,exp)}) =`,a:exp}
}
function genComplex(){
  const t=r(0,2);
  if(t===0){const n=r(0,3);return{q:`i^${n+4*r(0,3)} =`,a:['1','i','-1','-i'][n]}}
  if(t===1){const a=r(1,9),b=r(1,9),c=r(1,9),d=r(1,9);return{q:`(${a}+${b}i)(${c}+${d}i) real part =`,a:a*c-b*d}}
  const a=r(1,9),b=r(1,9);return{q:`|${a}+${b}i| =`,a:`√${a*a+b*b}`}
}
function genProbSets(){
  const a=r(5,20),b=r(5,20),both=r(1,Math.min(a,b)-1);
  return{q:`|A|=${a}, |B|=${b}, |A∩B|=${both}. |A∪B| =`,a:a+b-both}
}
function genPolygons(){
  const n=r(5,12);
  return r(0,1)?{q:`Interior angle of regular ${n}-gon =`,a:Math.round((n-2)*180/n)}
                :{q:`Diagonals of ${n}-gon =`,a:n*(n-3)/2}
}

// ── Topic registry ────────────────────────────────────────────────────────────
export const TOPICS = [
  {id:'foiling',   name:'FOIL / LIOF',          cat:'mult',cl:'Multiplication',diff:'MED', target:8000,baseK:220,lessonKey:'foiling',   gen:genMult2x2,
   hint:'Multiply ab×cd: ones=b×d, tens=(a×d+b×c)+carry, hundreds=a×c+carry.'},
  {id:'mult11',    name:'× 11 Trick',            cat:'mult',cl:'Multiplication',diff:'EASY',target:4000,baseK:180,lessonKey:'mult11',    gen:genMult11,
   hint:'Add adjacent digits left to right. 523×11: 5|5+2|2+3|3 = 5753. Carry when sum ≥ 10.'},
  {id:'mult101',   name:'× 101 Trick',           cat:'mult',cl:'Multiplication',diff:'EASY',target:5000,baseK:180,lessonKey:'mult101',   gen:genMult101,
   hint:'Write last 2 digits unchanged, then sum gap-connected digits moving left.'},
  {id:'mult25',    name:'× 25 / ÷ 25',          cat:'mult',cl:'Multiplication',diff:'EASY',target:4000,baseK:160,lessonKey:'mult25',    gen:genMult25,
   hint:'×25 = ×100÷4. ÷25 = ×4÷100.'},
  {id:'mult75',    name:'× 75 Trick',            cat:'mult',cl:'Multiplication',diff:'EASY',target:5000,baseK:170,lessonKey:'mult75',    gen:genMult75,
   hint:'×75 = (3/4)×100. Divide by 4, ×3, then ×100.'},
  {id:'near100',   name:'Near-100 Multiply',     cat:'mult',cl:'Multiplication',diff:'MED', target:6000,baseK:200,lessonKey:'near100',   gen:genNear100,
   hint:'103×108: last 2 digits=3×8=24, rest=103+8=111 → 11124.'},
  {id:'sq5',       name:'Squares Ending in 5',   cat:'mult',cl:'Multiplication',diff:'EASY',target:3500,baseK:150,lessonKey:'sq5',       gen:genSqEnds5,
   hint:'(a5)²= a(a+1) followed by 25. E.g. 85²: 8×9=72, append 25 → 7225.'},
  {id:'sq5059',    name:'Squares 41–59',          cat:'mult',cl:'Multiplication',diff:'MED', target:5000,baseK:180,lessonKey:'sq5059',    gen:genSq5059,
   hint:'(50±k)²: tens/ones = k², hundreds = 25±k. E.g. 57²: 49, 32 → 3249.'},
  {id:'equidist',  name:'Equidistant Multiply',  cat:'mult',cl:'Multiplication',diff:'MED', target:5000,baseK:190,lessonKey:'equidist',  gen:genEquidist,
   hint:'(n−k)(n+k)=n²−k². Square the middle, subtract the gap squared.'},
  {id:'reverses',  name:'Multiplying Reverses',  cat:'mult',cl:'Multiplication',diff:'MED', target:7000,baseK:200,lessonKey:'reverses',  gen:genReverses,
   hint:'ab×ba: ones=a×b(units), tens=a²+b²+carry, hundreds=a×b+carry.'},
  {id:'doublehalf',name:'Double & Half',         cat:'mult',cl:'Multiplication',diff:'EASY',target:4500,baseK:160,lessonKey:'doublehalf',gen:genDoubleHalf,
   hint:'Double one factor, halve the other. Great for ×15: 15×78 = 30×39 = 1170.'},
  {id:'endin5',    name:'Both End in 5',         cat:'mult',cl:'Multiplication',diff:'MED', target:6000,baseK:190,lessonKey:'endin5',    gen:genBothEnd5,
   hint:'a5×b5: last two = 25 (if a+b even) or 75 (if odd). Rest = a×b+⌊(a+b)/2⌋.'},
  {id:'mixednums', name:'Mixed Number ×',        cat:'mult',cl:'Multiplication',diff:'HARD',target:9000,baseK:250,lessonKey:'mixednums', gen:genMixedNums,
   hint:'n(p/d) × n(q/d) where p+q=d: whole part = n(n+1), fraction = p×q/d².'},
  {id:'diffsq',    name:'Difference of Squares', cat:'alg', cl:'Algebra',       diff:'EASY',target:3500,baseK:150,lessonKey:'diffsq',    gen:genDiffSquares,
   hint:'a²−b² = (a−b)(a+b). Instantly factor both sides.'},
  {id:'sumsq',     name:'Sum of Squares ×101',   cat:'alg', cl:'Algebra',       diff:'HARD',target:8000,baseK:240,lessonKey:'sumsq',     gen:genSumSquares,
   hint:'If units_a = tens_b+1 and tens_a + units_b = 10 → answer = (d₁²+d₂²)×101.'},
  {id:'consqsq',   name:'Consecutive Sq Sum',    cat:'alg', cl:'Algebra',       diff:'MED', target:6000,baseK:200,lessonKey:'consqsq',   gen:genConsecSq,
   hint:'n²+(n+1)² = 2n²+2n+1. If n ends in 5, compute n² with ×5 trick first.'},
  {id:'factoring', name:'Numerical Factoring',   cat:'alg', cl:'Algebra',       diff:'MED', target:6000,baseK:200,lessonKey:'factoring', gen:genFactoring,
   hint:'Spot common factors. ab+ac = a(b+c). Look for multiples of 11, 9, or squares.'},
  {id:'rem4',      name:'Remainder ÷ 4, 8',     cat:'div', cl:'Division',       diff:'EASY',target:3500,baseK:150,lessonKey:'rem4',      gen:genRem4,
   hint:'Divisible by 4: check last 2 digits. By 8: check last 3. By 16: last 4.'},
  {id:'rem9',      name:'Remainder ÷ 3, 9',     cat:'div', cl:'Division',       diff:'EASY',target:4000,baseK:150,lessonKey:'rem9',      gen:genRem9,
   hint:'Sum all digits. That sum mod 9 (or mod 3) = the remainder.'},
  {id:'rem11',     name:'Remainder ÷ 11',        cat:'div', cl:'Division',       diff:'MED', target:5000,baseK:180,lessonKey:'rem11',     gen:genRem11,
   hint:'Alternating sum from right: (odd positions) − (even positions) mod 11.'},
  {id:'remexpr',   name:'Remainder Expressions', cat:'div', cl:'Division',       diff:'HARD',target:9000,baseK:240,lessonKey:'remexpr',   gen:genRemExpr,
   hint:'"Algebra of remainders": replace each term with its remainder, then compute.'},
  {id:'div9trick', name:'Divide by 9 Trick',     cat:'div', cl:'Division',       diff:'MED', target:6000,baseK:200,lessonKey:'div9trick', gen:genDiv9,
   hint:'abcd÷9: hundreds=a, tens=a+b, ones=a+b+c, remainder=digit sum mod 9.'},
  {id:'squares',   name:'Squares 1–30',          cat:'mem', cl:'Memorization',   diff:'EASY',target:2500,baseK:120,lessonKey:'squares',   gen:genSquares,
   hint:'Must memorize 1²–30². Use equidistant trick for in-between values.'},
  {id:'cubes',     name:'Cubes 1–15',            cat:'mem', cl:'Memorization',   diff:'MED', target:3500,baseK:150,lessonKey:'cubes',     gen:genCubes,
   hint:'Memorize 1³=1 through 15³=3375.'},
  {id:'pow2',      name:'Powers 2, 3, 5',        cat:'mem', cl:'Memorization',   diff:'MED', target:3500,baseK:150,lessonKey:'pow2',      gen:genPowers,
   hint:'2¹²=4096, 2¹⁰=1024, 3⁷=2187, 3⁵=243, 5⁴=625, 5⁵=3125.'},
  {id:'fracs',     name:'Key Fractions',         cat:'mem', cl:'Memorization',   diff:'MED', target:4000,baseK:160,lessonKey:'fracs',     gen:genFracs,
   hint:'1/7=.142857 (cycle), 1/8=.125, 1/9=.111…, 1/11=.0909…, 1/12=.0833…'},
  {id:'seriessum', name:'Sum of Series',         cat:'mem', cl:'Memorization',   diff:'MED', target:5000,baseK:190,lessonKey:'seriessum', gen:genSeries,
   hint:'Σk=n(n+1)/2 · Σk²=n(n+1)(2n+1)/6 · Σk³=[n(n+1)/2]²'},
  {id:'fibonacci', name:'Fibonacci Numbers',     cat:'fib', cl:'Fibonacci',      diff:'EASY',target:3000,baseK:140,lessonKey:'fibonacci', gen:genFibonacci,
   hint:'1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584…'},
  {id:'fibsums',   name:'Fibonacci Sums',        cat:'fib', cl:'Fibonacci',      diff:'HARD',target:8000,baseK:230,lessonKey:'fibsums',   gen:genFibSums,
   hint:'Sum of first n Fibonacci = F(n+2)−1. Sum of n consecutive = 11×F₇ position.'},
  {id:'fibprops',  name:'Fibonacci Properties',  cat:'fib', cl:'Fibonacci',      diff:'HARD',target:10000,baseK:260,lessonKey:'fibprops', gen:genFibProps,
   hint:'Sum of any 10 consecutive Fibonacci = 11 × the 7th term of that group.'},
  {id:'divisors',  name:'Integral Divisors',     cat:'mem', cl:'Memorization',   diff:'MED', target:5000,baseK:190,lessonKey:'divisors',  gen:genDivisors,
   hint:'n=p₁^a·p₂^b → #divisors=(a+1)(b+1). Sum of divisors: product of (p^(e+1)−1)/(p−1).'},
  {id:'trig',      name:'Trig Values',           cat:'mem', cl:'Memorization',   diff:'MED', target:3500,baseK:160,lessonKey:'trig',      gen:genTrig,
   hint:'sin 0/30/45/60/90 = 0, ½, √2/2, √3/2, 1. cos reverses. tan=sin/cos.'},
  {id:'combperm',  name:'Combinations & Perms',  cat:'alg', cl:'Algebra',        diff:'MED', target:6000,baseK:200,lessonKey:'combperm',  gen:genCombPerm,
   hint:'P(n,r)=n!/(n−r)!   C(n,r)=n!/[r!(n−r)!]   Pascal\'s triangle shortcut.'},
  {id:'gcdlcm',    name:'GCD & LCM',             cat:'misc',cl:'Miscellaneous',  diff:'MED', target:5000,baseK:190,lessonKey:'gcdlcm',   gen:genGCDLCM,
   hint:'GCD×LCM=a×b. Euclidean: GCD(a,b)=GCD(b, a mod b).'},
  {id:'bases',     name:'Changing Bases',        cat:'base',cl:'Number Bases',   diff:'HARD',target:9000,baseK:240,lessonKey:'bases',     gen:genBases,
   hint:'To base 10: Σ digit×base^position. From base 10: divide repeatedly, read remainders up.'},
  {id:'repdec',    name:'Repeating Decimals',    cat:'misc',cl:'Miscellaneous',  diff:'HARD',target:8000,baseK:230,lessonKey:'repdec',   gen:genRepDec,
   hint:'.ā=a/9  .ab̄=ab/99  .ab̄b̄=(ab−a)/90  .ab̄c̄=(abc−a)/990'},
  {id:'modular',   name:'Modular Arithmetic',    cat:'misc',cl:'Miscellaneous',  diff:'HARD',target:9000,baseK:250,lessonKey:'modular',   gen:genModular,
   hint:'Fermat: a^(p−1)≡1(mod p). Wilson: (p−1)!≡−1(mod p). Reduce bases mod m first.'},
  {id:'factorial', name:'Factorials',            cat:'misc',cl:'Miscellaneous',  diff:'MED', target:4000,baseK:170,lessonKey:'factorial', gen:genFactorial,
   hint:'Trailing zeros = ⌊n/5⌋+⌊n/25⌋+… Wilson: (p−1)!≡−1(mod p).'},
  {id:'sqroots',   name:'Square Roots',          cat:'misc',cl:'Miscellaneous',  diff:'MED', target:4000,baseK:170,lessonKey:'sqroots',   gen:genSqroots,
   hint:'Approx √(a²+r)≈a+r/(2a). Know: √2≈1.414, √3≈1.732, √5≈2.236, √6≈2.449.'},
  {id:'limits',    name:'Limits',                cat:'calc',cl:'Calculus',       diff:'HARD',target:10000,baseK:260,lessonKey:'limits',   gen:genLimits,
   hint:'Substitute first. 0/0 form → factor/cancel. ∞/∞ → divide by highest power.'},
  {id:'derivs',    name:'Derivatives',           cat:'calc',cl:'Calculus',       diff:'HARD',target:9000,baseK:250,lessonKey:'derivs',    gen:genDerivs,
   hint:'Power rule: d/dx[xⁿ]=nxⁿ⁻¹. Product/chain rules for composition.'},
  {id:'integrals', name:'Integration',           cat:'calc',cl:'Calculus',       diff:'HARD',target:11000,baseK:270,lessonKey:'integrals',gen:genIntegrals,
   hint:'∫xⁿdx=xⁿ⁺¹/(n+1)+C. Definite: F(b)−F(a). Recognize common antiderivatives.'},
  {id:'logs',      name:'Log Rules',             cat:'alg', cl:'Algebra',        diff:'MED', target:6000,baseK:210,lessonKey:'logs',      gen:genLogs,
   hint:'log(ab)=loga+logb. log(aⁿ)=n·loga. logₐa=1. Change of base: logₐb=ln b/ln a.'},
  {id:'complex',   name:'Complex Numbers',       cat:'alg', cl:'Algebra',        diff:'HARD',target:8000,baseK:230,lessonKey:'complex',   gen:genComplex,
   hint:'i cycles 4: i¹=i, i²=−1, i³=−i, i⁴=1. (a+bi)(c+di)=(ac−bd)+(ad+bc)i.'},
  {id:'probsets',  name:'Probability & Sets',    cat:'misc',cl:'Miscellaneous',  diff:'MED', target:6000,baseK:200,lessonKey:'probsets',  gen:genProbSets,
   hint:'|A∪B|=|A|+|B|−|A∩B|. P(A|B)=P(A∩B)/P(B). Independent: P(A∩B)=P(A)·P(B).'},
  {id:'polygons',  name:'Polygons & Geometry',   cat:'misc',cl:'Miscellaneous',  diff:'MED', target:5000,baseK:190,lessonKey:'polygons',  gen:genPolygons,
   hint:'Interior angle=(n−2)×180/n. Diagonals=n(n−3)/2. Sum of exterior angles always 360°.'},
]

export const CAT_COLORS = {
  mult:'#00f0ff', div:'#ff9f43', mem:'#9d4edd', misc:'#00ff88',
  alg:'#ffd700',  calc:'#ff3366', base:'#54a0ff', fib:'#ff6b9d'
}

export const CAT_LABELS = {
  mult:'Multiplication', div:'Division', mem:'Memorization',
  alg:'Algebra', calc:'Calculus', base:'Number Bases', fib:'Fibonacci', misc:'Miscellaneous'
}

export const RADAR_GROUPS = [
  {l:'Multiply', ids:['foiling','mult11','mult25','near100','sq5','equidist','doublehalf']},
  {l:'Division', ids:['rem4','rem9','rem11','div9trick','remexpr']},
  {l:'Memory',   ids:['squares','cubes','fracs','trig','pow2']},
  {l:'Algebra',  ids:['diffsq','sumsq','logs','complex','combperm','factoring']},
  {l:'Fibonacci',ids:['fibonacci','fibsums','fibprops']},
  {l:'Misc',     ids:['gcdlcm','repdec','modular','probsets','polygons']},
  {l:'Bases',    ids:['bases']},
  {l:'Calculus', ids:['limits','derivs','integrals']},
]

// Chess-style K factor: decreases as you play more
// K = baseK * (1 - 0.6 * min(sessions, 30)/30)
// Minimum K = baseK * 0.4 (40% of base after 30+ sessions)
export function getKFactor(topic, sessionCount) {
  const sessions = Math.min(sessionCount || 0, 30)
  const decay = 1 - 0.6 * (sessions / 30)
  return Math.round(topic.baseK * decay)
}

// Rating formula
export function calcNewRating(topic, oldRating, accuracy, avgMs, sessionCount) {
  const K = getKFactor(topic, sessionCount)
  const targetMs = topic.target
  // Speed score: 1.0 at target/3, 0.0 at target*2.5
  const speedScore = Math.max(0, Math.min(1, 1 - (avgMs - targetMs/3) / (targetMs * 2.2)))
  const score = accuracy * 0.62 + speedScore * 0.38
  const delta = Math.round((score - 0.5) * K)
  return { newRating: Math.max(500, Math.min(2500, oldRating + delta)), delta, K }
}

export function ratingColor(r) {
  if (r >= 2200) return '#ff3366'
  if (r >= 1800) return '#ffd700'
  if (r >= 1400) return '#00ff88'
  if (r >= 1100) return '#00f0ff'
  return '#7a9bbf'
}
