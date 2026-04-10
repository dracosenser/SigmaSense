// src/data/lessons.js
// Interactive lesson content for each topic

export const LESSONS = {
  mult11: {
    title: '× 11 Trick',
    category: 'Multiplication',
    duration: '3 min',
    steps: [
      {
        type: 'concept',
        title: 'The Core Idea',
        content: 'Multiplying by 11 means "add adjacent digits." Start from the ones place, add pairs of digits as you move left, and carry when the sum ≥ 10.',
        formula: 'ab × 11 = a | (a+b) | b',
      },
      {
        type: 'example',
        title: 'Two-Digit Example',
        problem: '53 × 11',
        steps: [
          { label: 'Ones digit', action: '3 (last digit of 53)', result: '3' },
          { label: 'Tens digit', action: '5 + 3 = 8', result: '8' },
          { label: 'Hundreds digit', action: '5 (first digit of 53)', result: '5' },
        ],
        answer: '583',
      },
      {
        type: 'example',
        title: 'With a Carry',
        problem: '87 × 11',
        steps: [
          { label: 'Ones digit', action: '7', result: '7' },
          { label: 'Tens digit', action: '8 + 7 = 15 → write 5, carry 1', result: '5' },
          { label: 'Hundreds digit', action: '8 + 1 (carry) = 9', result: '9' },
        ],
        answer: '957',
      },
      {
        type: 'example',
        title: 'Three-Digit Number',
        problem: '523 × 11',
        steps: [
          { label: 'Ones', action: '3', result: '3' },
          { label: 'Tens', action: '2 + 3 = 5', result: '5' },
          { label: 'Hundreds', action: '5 + 2 = 7', result: '7' },
          { label: 'Thousands', action: '5', result: '5' },
        ],
        answer: '5753',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: '42 × 11', a: '462' },
          { q: '78 × 11', a: '858' },
          { q: '364 × 11', a: '4004' },
        ],
      },
    ],
  },

  mult25: {
    title: '× 25 / ÷ 25 Trick',
    category: 'Multiplication',
    duration: '2 min',
    steps: [
      {
        type: 'concept',
        title: 'The Key Insight',
        content: '25 = 100 ÷ 4. So multiplying by 25 is the same as dividing by 4 and then moving the decimal 2 places right (×100).',
        formula: 'n × 25 = (n ÷ 4) × 100',
      },
      {
        type: 'example',
        title: 'Multiply by 25',
        problem: '84 × 25',
        steps: [
          { label: 'Divide by 4', action: '84 ÷ 4 = 21', result: '21' },
          { label: 'Multiply by 100', action: '21 × 100', result: '2100' },
        ],
        answer: '2100',
      },
      {
        type: 'example',
        title: 'Odd Number Trick',
        problem: '166 × 25',
        steps: [
          { label: 'Divide by 4', action: '166 ÷ 4 = 41.5', result: '41.5' },
          { label: 'Multiply by 100', action: '41.5 × 100', result: '4150' },
        ],
        answer: '4150',
      },
      {
        type: 'concept',
        title: 'Dividing by 25',
        content: 'Flip it: divide by 25 = multiply by 4, then divide by 100.',
        formula: 'n ÷ 25 = (n × 4) ÷ 100',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: '240 × 25', a: '6000' },
          { q: '148 × 25', a: '3700' },
          { q: '416 ÷ 25', a: '16.64' },
        ],
      },
    ],
  },

  near100: {
    title: 'Near-100 Multiplication',
    category: 'Multiplication',
    duration: '5 min',
    steps: [
      {
        type: 'concept',
        title: 'Both Above 100',
        content: 'Express as (100+a) and (100+b). The result = 100×(first + b) followed by a×b as the last two digits.',
        formula: '(100+a)(100+b) = (100+a+b)×100 + a×b',
      },
      {
        type: 'example',
        title: 'Both Above 100',
        problem: '103 × 108',
        steps: [
          { label: 'a=3, b=8', action: 'Last 2 digits: 3×8 = 24', result: '24' },
          { label: 'Rest', action: '103 + 8 = 111 (or 108 + 3)', result: '111' },
        ],
        answer: '11124',
      },
      {
        type: 'example',
        title: 'Both Below 100',
        problem: '97 × 94',
        steps: [
          { label: 'a=3, b=6 (deficits)', action: 'Last 2 digits: 3×6 = 18', result: '18' },
          { label: 'Rest', action: '97 − 6 = 91 (or 94 − 3)', result: '91' },
        ],
        answer: '9118',
      },
      {
        type: 'example',
        title: 'One Above, One Below',
        problem: '103 × 94',
        steps: [
          { label: 'a=3 above, b=6 below', action: 'Last 2 digits: 100 − (3×6) = 82', result: '82' },
          { label: 'Rest', action: '103 − 6 − 1 = 96', result: '96' },
        ],
        answer: '9682',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: '96 × 97', a: '9312' },
          { q: '103 × 107', a: '11021' },
          { q: '108 × 93', a: '10044' },
        ],
      },
    ],
  },

  sq5: {
    title: 'Squares Ending in 5',
    category: 'Multiplication',
    duration: '2 min',
    steps: [
      {
        type: 'concept',
        title: 'The Pattern',
        content: 'Any number ending in 5 squared will ALWAYS end in 25. The leading digits come from multiplying the non-5 part by itself plus 1.',
        formula: '(a5)² = a×(a+1) followed by 25',
      },
      {
        type: 'example',
        title: 'Basic Example',
        problem: '85²',
        steps: [
          { label: 'Last two digits', action: 'Always 25', result: '25' },
          { label: 'Leading digits', action: '8 × (8+1) = 8 × 9 = 72', result: '72' },
        ],
        answer: '7225',
      },
      {
        type: 'example',
        title: 'Multi-digit Leading Part',
        problem: '115²',
        steps: [
          { label: 'Last two digits', action: 'Always 25', result: '25' },
          { label: 'Leading part', action: '11 × (11+1) = 11 × 12 = 132', result: '132' },
        ],
        answer: '13225',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: '35²', a: '1225' },
          { q: '75²', a: '5625' },
          { q: '105²', a: '11025' },
        ],
      },
    ],
  },

  sq5059: {
    title: 'Squares 41–59',
    category: 'Multiplication',
    duration: '3 min',
    steps: [
      {
        type: 'concept',
        title: 'Anchor at 50',
        content: 'Any number near 50 can be written as (50±k). Squaring gives 2500 ± 100k + k², which means: last two digits = k², leading digits = 25 ± k.',
        formula: '(50±k)² = (25±k) hundreds + k² ones',
      },
      {
        type: 'example',
        title: 'Above 50',
        problem: '57²',
        steps: [
          { label: 'k = 57−50 = 7', action: 'Last 2 digits: 7² = 49', result: '49' },
          { label: 'Leading digits', action: '25 + 7 = 32', result: '32' },
        ],
        answer: '3249',
      },
      {
        type: 'example',
        title: 'Below 50',
        problem: '46²',
        steps: [
          { label: 'k = 50−46 = 4', action: 'Last 2 digits: 4² = 16', result: '16' },
          { label: 'Leading digits', action: '25 − 4 = 21', result: '21' },
        ],
        answer: '2116',
      },
      {
        type: 'example',
        title: 'Carry Case',
        problem: '61²',
        steps: [
          { label: 'k = 11', action: 'Last 2 digits: 11² = 121 → write 21, carry 1', result: '21' },
          { label: 'Leading digits', action: '25 + 11 + 1(carry) = 37', result: '37' },
        ],
        answer: '3721',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: '53²', a: '2809' },
          { q: '44²', a: '1936' },
          { q: '58²', a: '3364' },
        ],
      },
    ],
  },

  diffsq: {
    title: 'Difference of Squares',
    category: 'Algebra',
    duration: '2 min',
    steps: [
      {
        type: 'concept',
        title: 'The Formula',
        content: 'a² − b² always factors as (a−b)(a+b). On the test, you\'ll often see consecutive or near-consecutive squares to subtract.',
        formula: 'a² − b² = (a−b)(a+b)',
      },
      {
        type: 'example',
        title: 'Consecutive Squares',
        problem: '54² − 53²',
        steps: [
          { label: 'a=54, b=53', action: '(54−53)(54+53)', result: '1 × 107' },
          { label: 'Multiply', action: '1 × 107', result: '107' },
        ],
        answer: '107',
      },
      {
        type: 'example',
        title: 'Gap of 2',
        problem: '76² − 74²',
        steps: [
          { label: 'a=76, b=74', action: '(76−74)(76+74)', result: '2 × 150' },
          { label: 'Multiply', action: '2 × 150', result: '300' },
        ],
        answer: '300',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: '73² − 72²', a: '145' },
          { q: '88² − 87²', a: '175' },
          { q: '63² − 57²', a: '720' },
        ],
      },
    ],
  },

  rem9: {
    title: 'Remainder ÷ 3 and ÷ 9',
    category: 'Division',
    duration: '3 min',
    steps: [
      {
        type: 'concept',
        title: 'Digit Sum Rule',
        content: 'The remainder when dividing by 9 equals the remainder of the digit sum divided by 9. Same logic applies for 3.',
        formula: 'n ≡ (sum of digits of n) mod 9',
      },
      {
        type: 'example',
        title: 'Example ÷ 9',
        problem: '34952 ÷ 9',
        steps: [
          { label: 'Sum digits', action: '3+4+9+5+2 = 23', result: '23' },
          { label: 'Sum again if needed', action: '2+3 = 5', result: '5' },
          { label: 'Remainder', action: '5 mod 9 = 5', result: 'r = 5' },
        ],
        answer: 'Remainder 5',
      },
      {
        type: 'example',
        title: 'Example ÷ 3',
        problem: '13579 ÷ 3',
        steps: [
          { label: 'Sum digits', action: '1+3+5+7+9 = 25', result: '25' },
          { label: 'Remainder', action: '25 mod 3 = 1', result: 'r = 1' },
        ],
        answer: 'Remainder 1',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: '24680 ÷ 9, remainder', a: '2' },
          { q: '13579 ÷ 9, remainder', a: '7' },
          { q: '2468 ÷ 3, remainder', a: '2' },
        ],
      },
    ],
  },

  fibonacci: {
    title: 'Fibonacci Numbers',
    category: 'Fibonacci',
    duration: '4 min',
    steps: [
      {
        type: 'concept',
        title: 'The Sequence',
        content: 'Each Fibonacci number is the sum of the two before it. You must memorize the first 16+ terms cold.',
        formula: 'F(n) = F(n−1) + F(n−2)',
      },
      {
        type: 'table',
        title: 'The First 16 Terms',
        headers: ['n', '1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'],
        values: ['F(n)','1','1','2','3','5','8','13','21','34','55','89','144','233','377','610','987'],
      },
      {
        type: 'concept',
        title: 'Key Property: Sum of 10 Consecutive',
        content: 'The sum of any 10 consecutive Fibonacci numbers equals 11 times the 7th term of that group. This is tested frequently!',
        formula: 'F(n)+F(n+1)+…+F(n+9) = 11 × F(n+6)',
      },
      {
        type: 'example',
        title: 'Sum of 10 Consecutive',
        problem: 'Sum of F(3) through F(12)',
        steps: [
          { label: '7th term in group', action: 'F(3+6) = F(9) = 34', result: '34' },
          { label: 'Multiply by 11', action: '11 × 34 = 374', result: '374' },
        ],
        answer: '374',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: 'F(10) =', a: '55' },
          { q: 'F(13) =', a: '233' },
          { q: 'Sum F(1)–F(10) =', a: '143' },
        ],
      },
    ],
  },

  limits: {
    title: 'Limits',
    category: 'Calculus',
    duration: '5 min',
    steps: [
      {
        type: 'concept',
        title: 'Direct Substitution',
        content: 'Most limit problems on number sense just need direct substitution. Plug in the value x approaches. If you get a real number, that\'s the limit.',
        formula: 'lim(x→a) f(x) = f(a)  if f is continuous at a',
      },
      {
        type: 'example',
        title: 'Direct Substitution',
        problem: 'lim(x→3) (x² + 2x)',
        steps: [
          { label: 'Substitute x=3', action: '3² + 2(3)', result: '9 + 6 = 15' },
        ],
        answer: '15',
      },
      {
        type: 'concept',
        title: '0/0 Form — Factor & Cancel',
        content: 'If substitution gives 0/0, factor the numerator and cancel the common (x−a) term.',
        formula: 'lim(x→a) (x²−a²)/(x−a) = lim(x→a) (x+a) = 2a',
      },
      {
        type: 'example',
        title: '0/0 Form',
        problem: 'lim(x→5) (x²−25)/(x−5)',
        steps: [
          { label: 'Factor numerator', action: '(x−5)(x+5)/(x−5)', result: '(x+5)' },
          { label: 'Cancel, substitute', action: '5+5', result: '10' },
        ],
        answer: '10',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: 'lim(x→4) (x²−16)/(x−4)', a: '8' },
          { q: 'lim(x→7) (x²−49)/(x−7)', a: '14' },
          { q: 'lim(x→3) (x²+2x+1)', a: '16' },
        ],
      },
    ],
  },

  derivs: {
    title: 'Derivatives',
    category: 'Calculus',
    duration: '5 min',
    steps: [
      {
        type: 'concept',
        title: 'Power Rule',
        content: 'The most common derivative rule on number sense. Multiply by the exponent, reduce the power by 1.',
        formula: 'd/dx[xⁿ] = n·xⁿ⁻¹',
      },
      {
        type: 'table',
        title: 'Key Derivative Rules',
        headers: ['Function', 'Derivative'],
        values: ['xⁿ → nxⁿ⁻¹', 'sin x → cos x', 'cos x → −sin x', 'eˣ → eˣ', 'ln x → 1/x', 'c → 0'],
      },
      {
        type: 'example',
        title: 'Power Rule Example',
        problem: 'd/dx[3x⁴] at x=2',
        steps: [
          { label: 'Apply power rule', action: '3 × 4 × x³ = 12x³', result: '12x³' },
          { label: 'Substitute x=2', action: '12 × 2³ = 12 × 8', result: '96' },
        ],
        answer: '96',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: 'd/dx[5x³] at x=1', a: '15' },
          { q: 'd/dx[x⁴] at x=2', a: '32' },
          { q: 'd/dx[2x²+3x] at x=3', a: '15' },
        ],
      },
    ],
  },

  squares: {
    title: 'Squares 1–30',
    category: 'Memorization',
    duration: '10 min',
    steps: [
      {
        type: 'table',
        title: 'Squares 1–15',
        headers: ['n','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'],
        values: ['n²','1','4','9','16','25','36','49','64','81','100','121','144','169','196','225'],
      },
      {
        type: 'table',
        title: 'Squares 16–30',
        headers: ['n','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30'],
        values: ['n²','256','289','324','361','400','441','484','529','576','625','676','729','784','841','900'],
      },
      {
        type: 'concept',
        title: 'Memory Trick: Equidistant',
        content: 'If you know 20²=400, you can find 19²=400−(20+19)=400−39=361 and 21²=400+(20+21)=441. Adjacent squares differ by (2n−1).',
        formula: 'n² = (n−1)² + (2n−1)',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: '17² =', a: '289' },
          { q: '23² =', a: '529' },
          { q: '28² =', a: '784' },
        ],
      },
    ],
  },

  repdec: {
    title: 'Repeating Decimals',
    category: 'Miscellaneous',
    duration: '5 min',
    steps: [
      {
        type: 'concept',
        title: 'Pattern: Single Digit Repeat',
        content: 'A single digit repeating = that digit over 9. Two digits repeating = those two digits over 99.',
        formula: '.āaaa… = a/9    .ababab… = ab/99',
      },
      {
        type: 'concept',
        title: 'Pattern: Mixed (non-repeating + repeating)',
        content: 'For .abbbb…: subtract the non-repeating part and divide by 90. For .abcbc…: use 990.',
        formula: '.ab̄b̄ = (ab − a)/90    .ab̄c̄ = (abc − a)/990',
      },
      {
        type: 'example',
        title: '.3333… as fraction',
        problem: '.3333…',
        steps: [
          { label: 'Single digit repeating', action: 'digit = 3, denominator = 9', result: '3/9' },
          { label: 'Simplify', action: '3/9 = 1/3', result: '1/3' },
        ],
        answer: '1/3',
      },
      {
        type: 'example',
        title: '.1666… as fraction',
        problem: '.1666…',
        steps: [
          { label: 'Form: .ab̄', action: 'a=1, b=6', result: '' },
          { label: 'Formula: (ab − a)/90', action: '(16 − 1)/90 = 15/90', result: '15/90' },
          { label: 'Simplify', action: '15/90 = 1/6', result: '1/6' },
        ],
        answer: '1/6',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: '.5555… as fraction', a: '5/9' },
          { q: '.2727… as fraction', a: '27/99 = 3/11' },
          { q: '.0833… as fraction', a: '1/12' },
        ],
      },
    ],
  },

  bases: {
    title: 'Changing Bases',
    category: 'Number Bases',
    duration: '6 min',
    steps: [
      {
        type: 'concept',
        title: 'Converting TO Base 10',
        content: 'Multiply each digit by base raised to its position (starting at 0 from right), then add everything up.',
        formula: '1101₂ = 1×8 + 1×4 + 0×2 + 1×1 = 13',
      },
      {
        type: 'example',
        title: 'Binary to Decimal',
        problem: '11010₂ to base 10',
        steps: [
          { label: 'Expand', action: '1×16 + 1×8 + 0×4 + 1×2 + 0×1', result: '16+8+0+2+0' },
          { label: 'Sum', action: '26', result: '26' },
        ],
        answer: '26',
      },
      {
        type: 'concept',
        title: 'Converting FROM Base 10',
        content: 'Repeatedly divide by the target base, record remainders. Read remainders bottom-to-top.',
        formula: '26 → base 2: 26÷2=13r0, 13÷2=6r1, 6÷2=3r0, 3÷2=1r1, 1÷2=0r1 → 11010₂',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: [
          { q: '13₁₀ in base 2', a: '1101' },
          { q: '255₁₀ in base 16', a: 'FF' },
          { q: '64₁₀ in base 8', a: '100' },
        ],
      },
    ],
  },
}

// Generate lesson list for topics that don't have full lessons yet
export function getLessonOrDefault(topicId, topicData) {
  if (LESSONS[topicId]) return LESSONS[topicId]
  return {
    title: topicData.name,
    category: topicData.cl,
    duration: '3 min',
    steps: [
      {
        type: 'concept',
        title: 'Key Concept',
        content: topicData.hint,
        formula: '',
      },
      {
        type: 'interactive',
        title: 'Practice',
        problems: Array.from({length: 3}, () => topicData.gen()),
      },
    ],
  }
}
