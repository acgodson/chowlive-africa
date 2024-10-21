import { DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';

type props = {
  isExpanded: boolean;
  activeTab: string | any;
  setActiveTab: (e: string) => void;
  onToggle: () => void;
};

const EcommercePanel = ({ isExpanded, onToggle, activeTab, setActiveTab }: props) => {
  return (
    <motion.div
      className='fixed top-0  left-0 h-full bg-neutral-800  text-white z-50'
      initial={{ width: 80 }}
      animate={{ width: isExpanded ? 320 : 80 }}
      transition={{ duration: 0.3 }}
    >
      <div className='p-4'>
        <button
          onClick={onToggle}
          className='absolute top-4 right-4 bg-white text-black rounded-full p-2'
        >
          <DoubleArrowRightIcon className={`transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {isExpanded && (
        <div className='mt-9'>
          <button
            className={`w-full p-2 ${activeTab === 'now playing' ? 'bg-gray-700' : ''}`}
            onClick={() => setActiveTab('now playing')}
          >
            Now Playing
          </button>
          <button
            className={`w-full p-2 ${activeTab === 'featured' ? 'bg-gray-700' : ''}`}
            onClick={() => setActiveTab('featured')}
          >
            Featured
          </button>
          {/* Add more tabs as needed */}
        </div>
      )}
    </motion.div>
  );
};

export default EcommercePanel;
