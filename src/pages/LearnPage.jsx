// src/pages/LearnPage.jsx
import { useState } from 'react'
import { TOPICS, CAT_COLORS } from '../data/topics'
import { LESSONS, getLessonOrDefault } from '../data/lessons'
import styles from './LearnPage.module.css'

export default function LearnPage() {
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [stepIdx, setStepIdx] = useState(0)
  const [practiceAnswers, setPracticeAnswers] = useState({})
  const [practiceResults, setPracticeResults] = useState({})
  const [filter, setFilter] = useState('all')

  const cats = ['all','mult','div','mem','alg','fib','misc','base','calc']
  const filtered = filter === 'all' ? TOPICS : TOPICS.filter(t => t.cat === filter)

  if (selectedTopic) {
    const lesson = getLessonOrDefault(selectedTopic.id, selectedTopic)
    const step = lesson.steps[stepIdx]
    const isLast = stepIdx === lesson.steps.length - 1

    const checkPractice = (idx, val) => {
      const correct = step.problems[idx].a
      const ok = String(val).trim().toLowerCase() === String(correct).trim().toLowerCase()
        || (!isNaN(val) && !isNaN(correct) && Math.abs(parseFloat(val)-parseFloat(correct)) < 0.0011)
      setPracticeResults(prev => ({...prev, [`${stepIdx}-${idx}`]: ok ? 'ok' : 'bad'}))
    }

    return (
      <div className={styles.lessonPage}>
        {/* Header */}
        <div className={styles.lessonHeader}>
          <button className={styles.backBtn} onClick={() => { setSelectedTopic(null); setStepIdx(0); setPracticeAnswers({}); setPracticeResults({}) }}>
            ◀ LESSONS
          </button>
          <div className={styles.lessonMeta}>
            <div className={styles.lessonTitle}>{lesson.title}</div>
            <div className={styles.lessonCat}>{lesson.category} · {lesson.duration}</div>
          </div>
          <div className={styles.stepPills}>
            {lesson.steps.map((s, i) => (
              <div
                key={i}
                className={`${styles.stepPill} ${i === stepIdx ? styles.stepActive : i < stepIdx ? styles.stepDone : ''}`}
                onClick={() => setStepIdx(i)}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className={styles.stepContent}>
          <div className={styles.stepTitle}>{step.title}</div>

          {step.type === 'concept' && (
            <div className={styles.conceptBlock}>
              <p className={styles.conceptText}>{step.content}</p>
              {step.formula && (
                <div className={styles.formulaBox}>
                  <span className={styles.formulaText}>{step.formula}</span>
                </div>
              )}
            </div>
          )}

          {step.type === 'example' && (
            <div className={styles.exampleBlock}>
              <div className={styles.exProblem}>
                <span className={styles.exLabel}>PROBLEM</span>
                <span className={styles.exQ}>{step.problem}</span>
              </div>
              <div className={styles.exSteps}>
                {step.steps.map((s, i) => (
                  <div className={styles.exStep} key={i}
                    style={{animationDelay:`${i*0.1}s`}}>
                    <div className={styles.exStepNum}>{i+1}</div>
                    <div className={styles.exStepBody}>
                      <div className={styles.exStepLabel}>{s.label}</div>
                      <div className={styles.exStepAction}>{s.action}</div>
                      {s.result && <div className={styles.exStepResult}>= {s.result}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.exAnswer}>
                <span className={styles.exAnswerLabel}>ANSWER</span>
                <span className={styles.exAnswerVal}>{step.answer}</span>
              </div>
            </div>
          )}

          {step.type === 'table' && (
            <div className={styles.tableBlock}>
              <div className={styles.tableScroll}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>{step.headers.map((h,i) => <th key={i} className={styles.dataThRight}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    <tr>{step.values.map((v,i) => <td key={i} className={styles.dataTd}>{v}</td>)}</tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step.type === 'interactive' && (
            <div className={styles.practiceBlock}>
              <div className={styles.practiceLabel}>TRY IT YOURSELF</div>
              {step.problems.map((p, idx) => {
                const key = `${stepIdx}-${idx}`
                const res = practiceResults[key]
                return (
                  <div className={styles.practiceRow} key={idx}>
                    <span className={styles.practiceQ}>{p.q}</span>
                    <input
                      className={`${styles.practiceInput} ${res==='ok'?styles.pOk:res==='bad'?styles.pBad:''}`}
                      type="text"
                      value={practiceAnswers[key]||''}
                      onChange={e => setPracticeAnswers(prev=>({...prev,[key]:e.target.value}))}
                      onKeyDown={e => e.key==='Enter' && checkPractice(idx, practiceAnswers[key]||'')}
                      placeholder="?"
                    />
                    <button
                      className={styles.checkBtn}
                      onClick={() => checkPractice(idx, practiceAnswers[key]||'')}
                    >CHECK</button>
                    {res && (
                      <span className={styles.practiceResult} style={{color:res==='ok'?'var(--green)':'var(--red)'}}>
                        {res==='ok' ? '✓' : `✗ ${p.a}`}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Nav */}
        <div className={styles.stepNav}>
          <button className={styles.navBtn} onClick={() => setStepIdx(i => Math.max(0, i-1))} disabled={stepIdx===0}>
            ◀ PREV
          </button>
          <span className={styles.stepCounter}>{stepIdx+1} / {lesson.steps.length}</span>
          {!isLast
            ? <button className={styles.navBtnPrimary} onClick={() => setStepIdx(i => i+1)}>NEXT ▶</button>
            : <button className={styles.navBtnDone} onClick={() => { setSelectedTopic(null); setStepIdx(0) }}>✓ DONE</button>
          }
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>// LEARNING CENTER</div>
        <div className={styles.pageSub}>Interactive lessons for every topic</div>
      </div>

      {/* Category filter */}
      <div className={styles.filterRow}>
        {cats.map(c => (
          <button
            key={c}
            className={`${styles.filterBtn} ${filter===c ? styles.filterActive : ''}`}
            style={filter===c && c !== 'all' ? {borderColor: CAT_COLORS[c], color: CAT_COLORS[c]} : {}}
            onClick={() => setFilter(c)}
          >
            {c === 'all' ? 'ALL' : c.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.topicsGrid}>
        {filtered.map(t => {
          const hasLesson = !!LESSONS[t.id]
          const color = CAT_COLORS[t.cat]
          return (
            <div
              key={t.id}
              className={styles.lessonCard}
              style={{'--acc': color}}
              onClick={() => { setSelectedTopic(t); setStepIdx(0); setPracticeAnswers({}); setPracticeResults({}) }}
            >
              <div className={styles.lcTop}>
                <div className={styles.lcCat} style={{color}}>{t.cl}</div>
                {hasLesson && <div className={styles.lcBadge}>LESSON</div>}
              </div>
              <div className={styles.lcName}>{t.name}</div>
              <div className={styles.lcHint}>{t.hint.slice(0, 80)}…</div>
              <div className={styles.lcFooter}>
                <span className={styles[`diff${t.diff}`]}>{t.diff}</span>
                <span className={styles.lcArrow}>→</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
