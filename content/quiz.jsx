import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const questions = [
  {
    id: 1,
    question: "What do you value most in an AI assistant?",
    options: [
      { text: "Deep thoughtfulness and nuance", scores: { claude: 3, gemini: 1, chatgpt: 1 } },
      { text: "Speed and getting things done fast", scores: { claude: 1, gemini: 2, chatgpt: 3 } },
      { text: "Integration with tools I already use", scores: { claude: 1, gemini: 3, chatgpt: 2 } },
      { text: "Creative and unexpected responses", scores: { claude: 2, gemini: 1, chatgpt: 3 } },
    ]
  },
  {
    id: 2,
    question: "How do you prefer to work?",
    options: [
      { text: "Carefully and methodically", scores: { claude: 3, gemini: 1, chatgpt: 1 } },
      { text: "Quickly and intuitively", scores: { claude: 1, gemini: 2, chatgpt: 3 } },
      { text: "Collaboratively with lots of tools", scores: { claude: 1, gemini: 3, chatgpt: 2 } },
      { text: "Experimentally and creatively", scores: { claude: 2, gemini: 2, chatgpt: 2 } },
    ]
  },
  {
    id: 3,
    question: "What would you mostly use AI for?",
    options: [
      { text: "Writing and editing", scores: { claude: 3, gemini: 1, chatgpt: 2 } },
      { text: "Coding and technical work", scores: { claude: 2, gemini: 2, chatgpt: 3 } },
      { text: "Research and fact-finding", scores: { claude: 2, gemini: 3, chatgpt: 1 } },
      { text: "Brainstorming and creative ideas", scores: { claude: 2, gemini: 1, chatgpt: 3 } },
    ]
  },
  {
    id: 4,
    question: "How do you feel about AI having opinions?",
    options: [
      { text: "I want it to be honest and direct", scores: { claude: 3, gemini: 1, chatgpt: 2 } },
      { text: "I prefer neutral and factual", scores: { claude: 1, gemini: 3, chatgpt: 1 } },
      { text: "I like a friendly conversational tone", scores: { claude: 2, gemini: 1, chatgpt: 3 } },
      { text: "I don't mind either way", scores: { claude: 2, gemini: 2, chatgpt: 2 } },
    ]
  },
  {
    id: 5,
    question: "Pick your vibe:",
    options: [
      { text: "📚 Thoughtful librarian", scores: { claude: 3, gemini: 1, chatgpt: 1 } },
      { text: "🔍 Curious researcher", scores: { claude: 1, gemini: 3, chatgpt: 1 } },
      { text: "⚡ Energetic assistant", scores: { claude: 1, gemini: 1, chatgpt: 3 } },
      { text: "🎨 Creative collaborator", scores: { claude: 2, gemini: 2, chatgpt: 2 } },
    ]
  }
]

const results = {
  claude: {
    name: "Claude",
    emoji: "🟠",
    description: "You value depth, nuance, and honest conversation. Claude is your match — thoughtful, careful, and great at writing and complex reasoning.",
    link: "https://claude.ai",
    color: "#FF6B35"
  },
  gemini: {
    name: "Gemini",
    emoji: "🔵",
    description: "You love research, facts, and seamless integration with your existing tools. Gemini is your match — powerful, connected, and great at finding information.",
    link: "https://gemini.google.com",
    color: "#4285F4"
  },
  chatgpt: {
    name: "ChatGPT",
    emoji: "🟢",
    description: "You want speed, creativity, and a fun conversational partner. ChatGPT is your match — energetic, versatile, and great for getting things done fast.",
    link: "https://chatgpt.com",
    color: "#10A37F"
  }
}

export default function Quiz() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleAnswer = async (option) => {
    setSelectedOption(option.text)
    await new Promise(resolve => setTimeout(resolve, 400))

    const newAnswers = [...answers, { question: questions[current].question, answer: option.text }]
    setAnswers(newAnswers)
    setSelectedOption(null)

    if (current + 1 < questions.length) {
      setCurrent(current + 1)
    } else {
      const scores = { claude: 0, gemini: 0, chatgpt: 0 }
      questions.forEach((q, i) => {
        const chosen = newAnswers[i]
        const matchedOption = q.options.find(o => o.text === chosen.answer)
        if (matchedOption) {
          scores.claude += matchedOption.scores.claude
          scores.gemini += matchedOption.scores.gemini
          scores.chatgpt += matchedOption.scores.chatgpt
        }
      })

      const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]

      setSaving(true)
      const { error } = await supabase.from('quiz_results').insert({
        answers: newAnswers,
        result: winner
      })
      if (error) console.error('Supabase error:', error)
      setSaving(false)
      setSaved(true)
      setResult(winner)
    }
  }

  const restart = () => {
    setCurrent(0)
    setAnswers([])
    setSelectedOption(null)
    setResult(null)
    setSaved(false)
  }

  if (saving) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <p>Calculating your result...</p>
      </div>
    )
  }

  if (result) {
    const r = results[result]
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h1>Your AI Match is... {r.emoji} {r.name}!</h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{r.description}</p>
        <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', background: r.color, color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem' }}>Try {r.name}</a>
        <br /><br />
        <button onClick={restart} style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: 8, border: '1px solid #ccc' }}>
          Retake Quiz
        </button>
        {saved && <p style={{ color: 'green', marginTop: '1rem' }}>Result saved to Supabase!</p>}
      </div>
    )
  }

  const q = questions[current]
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <h1>Which LLM Are You? 🤖</h1>
      <p style={{ color: '#666' }}>Question {current + 1} of {questions.length}</p>
      <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
        <h2>{q.question}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {q.options.map((option, i) => (
          <button key={i} onClick={() => handleAnswer(option)} style={{ padding: '0.75rem 1rem', textAlign: 'left', cursor: 'pointer', borderRadius: 8, border: selectedOption === option.text ? '1px solid #86efac' : '1px solid #ddd', background: selectedOption === option.text ? '#dcfce7' : 'white', fontSize: '1rem', transition: 'all 0.2s' }}>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  )
}
