import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { FiMenu, FiX } from 'react-icons/fi';

interface AuthHomeLayoutProps {
  children: React.ReactNode;
}

const AuthHomeLayout: React.FC<AuthHomeLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useTheme();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className='flex h-[calc(100vh-96px)] overflow-hidden'>
      {/* Sidebar for desktop */}
      <div
        className={`m-8 hidden md:flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 mr-4`}
      >
        <div
          className={`h-full rounded-lg pt-3 ${
            theme === 'light' ? 'bg-[#ffffff]' : 'bg-[#23272f]'
          }`}
        >
          <div
            className={`flex items-center h-16 px-4 ${
              sidebarOpen ? 'justify-between' : 'justify-center'
            }`}
          >
            <h2
              className={`font-semibold ${sidebarOpen ? '' : 'hidden'} ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}
            >
              Menu
            </h2>
            <button
              onClick={toggleSidebar}
              className={theme === 'light' ? 'text-gray-800' : 'text-white'}
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
          {/* Add your sidebar content here */}
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-40 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-black opacity-50 ${
            sidebarOpen ? '' : 'opacity-0'
          } transition-opacity duration-300`}
          onClick={toggleSidebar}
        ></div>
        <div
          className={`fixed inset-y-0 left-0 w-64 ${
            theme === 'light'
              ? 'bg-gradient-to-tr from-[#FAFAFA] to-[#EAEFF2]'
              : 'bg-gradient-to-tr from-[#1a1c20] to-[#2c313c]'
          } transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300`}
        >
          <div className='flex items-center justify-between h-16 px-4'>
            <h2 className={`font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
              Menu
            </h2>
            <button
              onClick={toggleSidebar}
              className={theme === 'light' ? 'text-gray-800' : 'text-white'}
            >
              <FiX size={24} />
            </button>
          </div>
          {/* Add your sidebar content here */}
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 overflow-y-auto pr-4'>
        <div className='md:hidden mb-4'>
          <button
            onClick={toggleSidebar}
            className={`p-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
          >
            <FiMenu size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthHomeLayout;
