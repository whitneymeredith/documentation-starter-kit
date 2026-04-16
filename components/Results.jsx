import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const LLM_COLORS = {
  claude: '#FF6B35',
  gemini: '#4285F4',
  chatgpt: '#10A37F'
}

const LLM_EMOJIS = {
  claude: '🟠',
  gemini: '🔵',
  chatgpt: '🟢'
}

export default function Results() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function fetchResults() {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('result')

      if (error) {
        console.error('Error fetching results:', error)
        return
      }

      const counts = { claude: 0, gemini: 0, chatgpt: 0 }
      data.forEach(row => {
        if (counts[row.result] !== undefined) {
          counts[row.result]++
        }
      })

      setTotal(data.length)
      setResults([
        { name: 'Claude', key: 'claude', count: counts.claude },
        { name: 'Gemini', key: 'gemini', count: counts.gemini },
        { name: 'ChatGPT', key: 'chatgpt', count: counts.chatgpt },
      ])
      setLoading(false)
    }

    fetchResults()
  }, [])

  if (loading) {
    return <p>Loading results...</p>
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem' }}>
      <p style={{ opacity: 0.6, marginBottom: '2rem' }}>{total} people have taken the quiz</p>
      {results.map(r => {
        const percentage = total > 0 ? Math.round((r.count / total) * 100) : 0
        return (
          <div key={r.key} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>{LLM_EMOJIS[r.key]} {r.name}</span>
              <span>{r.count} ({percentage}%)</span>
            </div>
            <div style={{ background: 'rgba(128,128,128,0.2)', borderRadius: 8, height: 12 }}>
              <div style={{ width: `${percentage}%`, background: LLM_COLORS[r.key], borderRadius: 8, height: 12, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}