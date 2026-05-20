import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { AuthProvider } from '@/components/AuthProvider';
import { Toast } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Stuns — Premium Online Store',
  description: 'Luxury shopping with secure payments, instant checkout, and real order management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <Header />
          <main className="min-h-[calc(100vh-140px)]">{children}</main>
          <footer className="mt-20 border-t border-white/10 py-10 text-center text-sm text-white/50">
            © {new Date().getFullYear()} Stuns · Premium E-Commerce
          </footer>
          <Toast />
        </AuthProvider>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </body>
    </html>
  );
}
