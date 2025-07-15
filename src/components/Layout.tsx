
import React from 'react';
import Header from '@/components/Header';
import AdaptiveLogo from '@/components/AdaptiveLogo';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <AdaptiveLogo size="sm" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Copyright © 2025 Tecnolog
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
