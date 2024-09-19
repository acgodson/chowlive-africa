import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { FiHome, FiUser, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface AuthHomeLayoutProps {
  children: React.ReactNode;
  setIndex: any;
}

const AuthHomeLayout: React.FC<AuthHomeLayoutProps> = ({ children, setIndex }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const { theme } = useTheme();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setIndex(index);
  };

  const TabButton = ({ icon, text, index }: { icon: React.ReactNode; text: string; index: number }) => (
    <button
      onClick={() => handleTabClick(index)}
      className={`flex items-center w-full py-3 px-4 ${
        activeTab === index
          ? 'bg-[#CB302B] text-white'
          : theme === 'light'
          ? 'text-gray-800 hover:bg-[#FCEFDC]'
          : 'text-white hover:bg-[#541413]'
      } transition-colors duration-200`}
    >
      <div className={`${sidebarOpen ? 'mr-3' : 'mx-auto'}`}>{icon}</div>
      {sidebarOpen && <span>{text}</span>}
    </button>
  );

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
              className={`${theme === 'light' ? 'text-gray-800' : 'text-white'} focus:outline-none`}
            >
              {sidebarOpen ? <FiChevronLeft size={24} /> : <FiChevronRight size={24} />}
            </button>
          </div>
          {/*  sidebar content */}
          <div className='mt-8'>
            <TabButton icon={<FiHome size={20} />} text='Rooms' index={0} />
            <TabButton icon={<FiUser size={20} />} text='My Account' index={1} />
          </div>
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
              <FiChevronLeft size={24} />
            </button>
          </div>
          {/* mobile sidebar content */}
          <div className='mt-8'>
            <TabButton icon={<FiHome size={20} />} text='Rooms' index={0} />
            <TabButton icon={<FiUser size={20} />} text='My Account' index={1} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 overflow-y-auto pr-4'>
        <div className='md:hidden mb-4'>
          <button
            onClick={toggleSidebar}
            className={`p-2 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
          >
            <FiChevronRight size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthHomeLayout;
