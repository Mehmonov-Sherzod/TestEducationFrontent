import { useMemo } from 'react'
import katex from 'katex'

interface MathRendererProps {
  text: string
  className?: string
}

/**
 * Renders text with LaTeX math formulas
 * Inline math: $formula$
 * Display math: $$formula$$
 */
export const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const renderedHtml = useMemo(() => {
    if (!text) return ''

    let result = text

    // Replace display math $$...$$ with rendered HTML
    result = result.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          strict: false,
        })
      } catch (e) {
        console.error('KaTeX error:', e)
        return match
      }
    })

    // Replace inline math $...$ with rendered HTML
    result = result.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
          strict: false,
        })
      } catch (e) {
        console.error('KaTeX error:', e)
        return match
      }
    })

    return result
  }, [text])

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  )
}

export default MathRenderer
