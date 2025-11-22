import type { AddressData, EthTransaction, TokenTransaction } from '../types'
import { sanitizeSymbol, sanitizeUrls } from './sanitize'
import { getAccountId } from './address'

// Format Wei to ETH with proper decimal places
export function weiToEth(wei: string): string {
  const weiNum = BigInt(wei)
  const ethWhole = weiNum / BigInt(10 ** 18)
  const ethFraction = weiNum % BigInt(10 ** 18)

  const fractionStr = ethFraction.toString().padStart(18, '0')
  // Trim trailing zeros but keep at least 6 decimal places
  let trimmed = fractionStr.replace(/0+$/, '')
  if (trimmed.length < 6) trimmed = fractionStr.slice(0, 6)

  return `${ethWhole}.${trimmed || '0'}`
}

// Format token amount with decimals
export function formatTokenAmount(value: string, decimals: string): string {
  const parsed = parseInt(decimals, 10)
  const dec = Number.isNaN(parsed) ? 18 : parsed
  if (dec === 0) return value

  const valueStr = value.padStart(dec + 1, '0')
  const intPart = valueStr.slice(0, -dec) || '0'
  const fracPart = valueStr.slice(-dec)

  // Trim trailing zeros but keep at least some precision
  let trimmed = fracPart.replace(/0+$/, '')
  if (trimmed.length < 4 && fracPart.length >= 4) {
    trimmed = fracPart.slice(0, 4)
  }

  return trimmed ? `${intPart}.${trimmed}` : intPart
}

// Format Unix timestamp to Beancount date (YYYY-MM-DD)
export function formatDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp, 10) * 1000)
  return date.toISOString().split('T')[0]
}

// Generate Beancount output from address data
export function generateBeancountOutput(
  addressData: Map<string, AddressData>,
  nicknames: Map<string, string>
): string {
  const output: string[] = []
  const userAddresses = new Set<string>()
  const externalAddresses = new Map<string, string>() // address -> first seen date
  const tokens = new Map<string, string>() // symbol -> name

  // Collect all user addresses
  for (const [address] of addressData) {
    userAddresses.add(address.toLowerCase())
  }

  // Collect all transactions and external addresses
  const allTxs: Array<{
    type: 'eth' | 'token'
    tx: EthTransaction | TokenTransaction
    userAddress: string
  }> = []

  for (const [address, data] of addressData) {
    for (const tx of data.transactions) {
      allTxs.push({ type: 'eth', tx, userAddress: address })
      const from = tx.from.toLowerCase()
      const to = tx.to.toLowerCase()
      if (!userAddresses.has(from) && !externalAddresses.has(from)) {
        externalAddresses.set(from, formatDate(tx.timeStamp))
      }
      if (to && !userAddresses.has(to) && !externalAddresses.has(to)) {
        externalAddresses.set(to, formatDate(tx.timeStamp))
      }
    }
    for (const tx of data.tokenTransactions) {
      allTxs.push({ type: 'token', tx, userAddress: address })
      const symbol = sanitizeSymbol(tx.tokenSymbol)
      if (!tokens.has(symbol)) {
        tokens.set(symbol, sanitizeUrls(tx.tokenName))
      }
      const from = tx.from.toLowerCase()
      const to = tx.to.toLowerCase()
      if (!userAddresses.has(from) && !externalAddresses.has(from)) {
        externalAddresses.set(from, formatDate(tx.timeStamp))
      }
      if (to && !userAddresses.has(to) && !externalAddresses.has(to)) {
        externalAddresses.set(to, formatDate(tx.timeStamp))
      }
    }
  }

  // Sort all transactions by timestamp
  allTxs.sort((a, b) => parseInt(a.tx.timeStamp) - parseInt(b.tx.timeStamp))

  // Find earliest date for account opening
  const earliestDate =
    allTxs.length > 0 ? formatDate(allTxs[0].tx.timeStamp) : '2015-07-30'

  // Generate commodity declarations
  output.push('; Commodity Declarations')
  output.push(`${earliestDate} commodity ETH`)
  for (const [symbol, name] of tokens) {
    output.push(`${earliestDate} commodity ${symbol} ; ${name}`)
  }
  output.push('')

  // Generate account declarations for user addresses
  output.push('; User Account Declarations')
  for (const [address, data] of addressData) {
    const nickname = nicknames.get(address.toLowerCase()) || data.nickname
    const accountId = getAccountId(address)
    const prefix = nickname
      ? `Assets:Crypto:Ethereum:${sanitizeAccountName(nickname)}`
      : `Assets:Crypto:Ethereum`

    output.push(
      `${earliestDate} open ${prefix}:${accountId} ETH ; ${address}`
    )

    // Token accounts
    const addressTokens = new Set<string>()
    for (const tx of data.tokenTransactions) {
      addressTokens.add(sanitizeSymbol(tx.tokenSymbol))
    }
    for (const symbol of addressTokens) {
      output.push(
        `${earliestDate} open ${prefix}:${accountId}:${symbol} ${symbol}`
      )
    }
  }
  output.push('')

  // Generate external account declarations
  output.push('; External Account Declarations')
  for (const [address, date] of externalAddresses) {
    const accountId = getAccountId(address)
    output.push(
      `${date} open Assets:Crypto:Ethereum:External:${accountId} ; ${address}`
    )
  }
  output.push('')

  // Generate expense and income accounts
  output.push('; Expense and Income Accounts')
  output.push(`${earliestDate} open Expenses:Crypto:GasFees ETH`)
  output.push(`${earliestDate} open Income:Crypto:Ethereum`)
  output.push(`${earliestDate} open Expenses:Crypto:Ethereum`)
  output.push('')

  // Generate transactions
  output.push('; Transactions')
  for (const { type, tx, userAddress } of allTxs) {
    if (type === 'eth') {
      output.push(generateEthTransaction(tx as EthTransaction, userAddress, userAddresses, nicknames))
    } else {
      output.push(generateTokenTransaction(tx as TokenTransaction, userAddress, userAddresses, nicknames))
    }
  }

  return output.join('\n')
}

// Sanitize account name
function sanitizeAccountName(name: string): string {
  const sanitized = sanitizeUrls(name).replace(/[^a-zA-Z0-9\-_.]/g, '')
  if (!sanitized) return 'Account'
  return sanitized.charAt(0).toUpperCase() + sanitized.slice(1)
}

// Generate single ETH transaction entry
function generateEthTransaction(
  tx: EthTransaction,
  userAddress: string,
  userAddresses: Set<string>,
  nicknames: Map<string, string>
): string {
  const lines: string[] = []
  const date = formatDate(tx.timeStamp)
  const value = weiToEth(tx.value)
  const gasUsed = weiToEth(
    (BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString()
  )
  const isFailed = tx.isError === '1'
  const from = tx.from.toLowerCase()
  const to = tx.to?.toLowerCase() || ''

  const isFromUser = userAddresses.has(from)
  const isToUser = to && userAddresses.has(to)
  const isInternal = isFromUser && isToUser

  // Determine transaction description
  let description = ''
  if (isFailed) {
    description = 'Failed Transaction'
  } else if (isInternal) {
    description = 'Internal Transfer'
  } else if (isFromUser) {
    description = 'ETH Transfer Out'
  } else {
    description = 'ETH Transfer In'
  }

  // Get account names
  const getAccName = (addr: string) => {
    const nickname = nicknames.get(addr)
    const accId = getAccountId(addr)
    if (nickname) {
      return `Assets:Crypto:Ethereum:${sanitizeAccountName(nickname)}:${accId}`
    }
    if (userAddresses.has(addr)) {
      return `Assets:Crypto:Ethereum:${accId}`
    }
    return `Assets:Crypto:Ethereum:External:${accId}`
  }

  const flag = isFailed ? '!' : '*'
  lines.push(`${date} ${flag} "${description}"`)
  lines.push(`  txhash: "${tx.hash}"`)
  lines.push(`  etherscan: "https://etherscan.io/tx/${tx.hash}"`)

  if (isFailed) {
    // Failed transaction only has gas cost
    lines.push(`  ${getAccName(from)} -${gasUsed} ETH`)
    lines.push(`  Expenses:Crypto:GasFees ${gasUsed} ETH`)
  } else if (isInternal) {
    // Internal transfer between user addresses
    lines.push(`  ${getAccName(from)} -${value} ETH`)
    lines.push(`  ${getAccName(to)} ${value} ETH`)
    if (from === userAddress) {
      // Gas paid by sender
      lines.push(`  ${getAccName(from)} -${gasUsed} ETH`)
      lines.push(`  Expenses:Crypto:GasFees ${gasUsed} ETH`)
    }
  } else if (isFromUser) {
    // Outgoing transfer
    lines.push(`  ${getAccName(from)} -${value} ETH`)
    lines.push(`  ${getAccName(to)} ${value} ETH`)
    lines.push(`  ${getAccName(from)} -${gasUsed} ETH`)
    lines.push(`  Expenses:Crypto:GasFees ${gasUsed} ETH`)
  } else {
    // Incoming transfer
    lines.push(`  ${getAccName(from)} -${value} ETH`)
    lines.push(`  ${getAccName(to)} ${value} ETH`)
  }

  lines.push('')
  return lines.join('\n')
}

// Generate single token transaction entry
function generateTokenTransaction(
  tx: TokenTransaction,
  _userAddress: string,
  userAddresses: Set<string>,
  nicknames: Map<string, string>
): string {
  const lines: string[] = []
  const date = formatDate(tx.timeStamp)
  const symbol = sanitizeSymbol(tx.tokenSymbol)
  const value = formatTokenAmount(tx.value, tx.tokenDecimal)
  const from = tx.from.toLowerCase()
  const to = tx.to?.toLowerCase() || ''

  const isFromUser = userAddresses.has(from)
  const isToUser = to && userAddresses.has(to)

  // Determine transaction description
  const tokenName = sanitizeUrls(tx.tokenName)
  let description = ''
  if (isFromUser && isToUser) {
    description = `Internal ${tokenName} Transfer`
  } else if (isFromUser) {
    description = `${tokenName} Transfer Out`
  } else {
    description = `${tokenName} Transfer In`
  }

  // Get account names for tokens
  const getTokenAccName = (addr: string, sym: string) => {
    const nickname = nicknames.get(addr)
    const accId = getAccountId(addr)
    if (nickname) {
      return `Assets:Crypto:Ethereum:${sanitizeAccountName(nickname)}:${accId}:${sym}`
    }
    if (userAddresses.has(addr)) {
      return `Assets:Crypto:Ethereum:${accId}:${sym}`
    }
    return `Assets:Crypto:Ethereum:External:${accId}:${sym}`
  }

  lines.push(`${date} * "${description}"`)
  lines.push(`  txhash: "${tx.hash}"`)
  lines.push(`  etherscan: "https://etherscan.io/tx/${tx.hash}"`)
  lines.push(`  ${getTokenAccName(from, symbol)} -${value} ${symbol}`)
  lines.push(`  ${getTokenAccName(to, symbol)} ${value} ${symbol}`)
  lines.push('')

  return lines.join('\n')
}
