import { useCallback } from 'react'

interface OutputDisplayProps {
  output: string
}

export function OutputDisplay({ output }: OutputDisplayProps) {
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = output
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }, [output])

  if (!output) return null

  return (
    <div className="output-section">
      <div className="output-header">
        <h3>Beancount Output</h3>
        <button
          type="button"
          onClick={copyToClipboard}
          className="copy-button"
          aria-label="Copy output to clipboard"
        >
          Copy to Clipboard
        </button>
      </div>
      <textarea
        className="output-textarea"
        value={output}
        readOnly
        aria-label="Beancount output"
      />
    </div>
  )
}
