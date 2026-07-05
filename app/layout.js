import './globals.css'
import Navbar from './components/Navbar'

export const metadata = {
  title: 'እቁብ - Digital Equb Platform',
  description: 'Modern digital equb (community savings) platform for Ethiopia',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}