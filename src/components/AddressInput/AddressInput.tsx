interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function AddressInput({ value, onChange, disabled }: AddressInputProps) {
  return (
    <div className="input-group">
      <label htmlFor="ethAddresses">
        Ethereum Addresses
        <span className="label-hint">
          (one per line, optional nickname format: address:nickname)
        </span>
      </label>
      <textarea
        id="ethAddresses"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f2e678&#10;0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B:vitalik.eth"
        rows={5}
        aria-label="Ethereum addresses"
      />
    </div>
  )
}
