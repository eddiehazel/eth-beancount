import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ETH Beancount - Ethereum Transaction Converter',
  description:
    'Convert Ethereum blockchain transactions to Beancount format for plaintext double-entry accounting.',
  keywords: ['ethereum', 'beancount', 'accounting', 'crypto', 'plaintext accounting'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  viewBox="0 0 256 417"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid"
                >
                  <path
                    fill="currentColor"
                    d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"
                  />
                  <path
                    fill="currentColor"
                    opacity="0.6"
                    d="M127.962 0L0 212.32l127.962 75.639V154.158z"
                  />
                  <path
                    fill="currentColor"
                    d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"
                  />
                  <path
                    fill="currentColor"
                    opacity="0.6"
                    d="M127.962 416.905v-104.72L0 236.585z"
                  />
                </svg>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    ETH Beancount
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ethereum to Beancount Converter
                  </p>
                </div>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8">
            <div className="max-w-4xl mx-auto px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                Client-side only. Your data never leaves your browser.
                <a
                  href="https://github.com/eddiehazel/eth-beancount"
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
