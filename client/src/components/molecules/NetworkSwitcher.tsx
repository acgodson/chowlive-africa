import React from 'react';
import Head from 'next/head';
import { FaArrowRight } from 'react-icons/fa';
import { networks } from '@/utils/configs/web3';
import { useAuthContext } from '@/providers/web3-provider';

const NetworkSwitcher = () => {
  const { selectedNetwork, handleNetworkChange } = useAuthContext();

  return (
    <>
      <Head>
        <link
          href='https://fonts.googleapis.com/css2?family=Days+One&family=Neue+Haas+Grotesk+Display+Pro:wght@400;700&display=swap'
          rel='stylesheet'
        />
      </Head>

      <div className='flex items-center bg-gray-200 dark:bg-white dark:bg-opacity-10 rounded-full p-1 backdrop-filter backdrop-blur-sm'>
        <select
          id='network-select'
          value={selectedNetwork.id}
          onChange={handleNetworkChange}
          className='bg-transparent text-gray-800 dark:text-white border-none rounded-full py-2 pl-3 pr-2 focus:outline-none focus:ring-2 focus:ring-[#CB302B] appearance-none cursor-pointer'
        >
          {networks.map((network) => (
            <option key={network.id} value={network.id} className='text-gray-800 bg-white dark:text-white dark:bg-gray-800'>
              {network.name}
            </option>
          ))}
        </select>
        <FaArrowRight className='mx-2 text-gray-800 dark:text-white flex-shrink-0' />
        <div className='bg-white bg-opacity-50 dark:bg-white dark:bg-opacity-20 rounded-full py-2 px-3 text-gray-800 dark:text-white whitespace-nowrap'>
          Base Sepolia
        </div>
      </div>
    </>
  );
};

export default NetworkSwitcher;