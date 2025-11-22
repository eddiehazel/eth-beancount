interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ApiKeyInput({ value, onChange, disabled }: ApiKeyInputProps) {
  return (
    <div className="input-group">
      <label htmlFor="apiKey">
        Etherscan API Key
        <span className="label-hint">(optional, for higher rate limits)</span>
      </label>
      <input
        type="password"
        id="apiKey"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Your Etherscan API key"
        aria-label="Etherscan API key"
      />
    </div>
  )
}
