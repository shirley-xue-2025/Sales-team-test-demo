import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useMobile } from '@/hooks/use-mobile';

const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  const [location] = useLocation();

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  useEffect(() => {
    // Keep sidebar open on desktop
    if (!isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 md:relative ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and app name */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <span className="text-green-500 text-xl font-bold">⮡ ablefy</span>
            </div>
            <button 
              className="md:hidden text-gray-400 hover:text-white" 
              onClick={() => setSidebarOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Navigation links */}
          <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
            <Link href="/">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-sm ${location === '/' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <span>Overview</span>
              </a>
            </Link>
            
            <Link href="/products">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-sm ${location === '/products' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>Products</span>
              </a>
            </Link>
            
            <Link href="/pages">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-sm ${location === '/pages' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>Pages</span>
              </a>
            </Link>
            
            <Link href="/marketing">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-sm ${location === '/marketing' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>Marketing</span>
              </a>
            </Link>
            
            <div className="relative">
              <Link href="/sales-team">
                <a className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-sm ${location.startsWith('/sales-team') || location === '/roles' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white'}`}>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Sales Team</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </Link>
              
              {/* Submenu */}
              <div className="pl-10 mt-1 space-y-1">
                <Link href="/deals">
                  <a className={`block px-3 py-1 text-sm text-gray-400 hover:text-white ${location === '/deals' ? 'text-white' : ''}`}>
                    Deals
                  </a>
                </Link>
                <Link href="/incentive-plan">
                  <a className={`block px-3 py-1 text-sm text-gray-400 hover:text-white ${location === '/incentive-plan' ? 'text-white' : ''}`}>
                    Incentive plan
                  </a>
                </Link>
                <Link href="/roles">
                  <a className={`block px-3 py-1 text-sm text-gray-400 hover:text-white ${location === '/roles' ? 'text-white' : ''}`}>
                    Members/Roles
                  </a>
                </Link>
              </div>
            </div>
            
            <Link href="/payments">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-sm ${location === '/payments' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                <span>Payments</span>
              </a>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Mobile trigger button */}
      {isMobile && !sidebarOpen && (
        <button
          className="fixed left-4 top-4 z-30 p-2 rounded-md bg-primary-500 text-white"
          onClick={() => setSidebarOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
};

export default Sidebar;
