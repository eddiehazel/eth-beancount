'use client'

import { Textarea } from './ui'

export interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function AddressInput({ value, onChange, disabled }: AddressInputProps) {
  return (
    <div className="space-y-2">
      <Textarea
        label="Ethereum Addresses"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter one address per line, optionally with nickname:
0x1234567890abcdef1234567890abcdef12345678
0xabcdef1234567890abcdef1234567890abcdef12:MyWallet
0x9876543210fedcba9876543210fedcba98765432:Savings`}
        rows={6}
        disabled={disabled}
        helperText="Format: address or address:nickname (one per line)"
      />
    </div>
  )
}
