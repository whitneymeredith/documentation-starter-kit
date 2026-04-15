import React from 'react'

export default {
  logo: <span>Which LLM Are You?</span>,
  project: {
    link: 'https://github.com/whitneymeredith/documentation-starter-kit'
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Which LLM Are You?'
    }
  }
}
