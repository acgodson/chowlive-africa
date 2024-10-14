import React, { createContext, useContext, ReactNode } from 'react';

interface RadioGroupContextType {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

interface RadioGroupProps {
  name: string;
  defaultValue?: string;
  children: ReactNode;
  onChange?: (value: string) => void;
}

interface RadioGroupItemProps {
  value: string;
  id: string;
  children?: React.ReactNode;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  defaultValue,
  onChange,
  children,
}) => {
  const [value, setValue] = React.useState(defaultValue || '');

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <RadioGroupContext.Provider value={{ name, value, onChange: handleChange }}>
      <div className='space-y-2'>{children}</div>
    </RadioGroupContext.Provider>
  );
};

export const useRadioGroup = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('useRadioGroup must be used within a RadioGroup');
  }
  return context;
};

export const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, id, children }) => {
  const { name, value: groupValue, onChange } = useRadioGroup();

  return (
    <div className='flex items-center space-x-2'>
      <input
        type='radio'
        id={id}
        name={name}
        value={value}
        checked={value === groupValue}
        onChange={() => onChange(value)}
        className='h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500'
      />
      {children}
    </div>
  );
};

