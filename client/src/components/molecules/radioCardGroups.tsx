import React from 'react';

import { FaLaptop, FaPhone, FaSpeakerDeck, FaHeadphones } from 'react-icons/fa';
import { Card, CardContent } from '../atoms';
import { Label } from '../atoms/label';
import { cn } from '@/utils';
import { RadioGroup, RadioGroupItem } from '../atoms/radio-group';

interface RadioCardGroupOption {
  label: string;
  value: string;
  type?: string;
  isChecked?: boolean;
}

interface RadioCardGroupProps {
  name: string;
  options: RadioCardGroupOption[];
  onChange: (value: string) => void;
  isLoading?: boolean;
}

const getDeviceIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'computer':
      return FaLaptop;
    case 'smartphone':
      return FaPhone;
    case 'speaker':
      return FaSpeakerDeck;
    default:
      return FaHeadphones;
  }
};

const RadioCardGroup: React.FC<RadioCardGroupProps> = ({ name, options, onChange, isLoading }) => {
  return (
    <RadioGroup
      onValueChange={onChange}
      name={name}
      className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    >
      {options.map((option) => {
        const Icon = getDeviceIcon(option.type || '');
        return (
          <div key={option.value}>
            <RadioGroupItem
              value={option.value}
              id={option.value}
              className='peer sr-only'
              disabled={isLoading}
              defaultChecked={option.isChecked}
            />
            <Label htmlFor={option.value} className='cursor-pointer'>
              <Card
                className={cn(
                  'border-2 transition-all',
                  'hover:border-primary hover:shadow-md',
                  'peer-checked:border-primary peer-checked:bg-primary/10',
                  'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed'
                )}
              >
                <CardContent className='flex flex-col items-center justify-center p-6'>
                  <Icon className='w-12 h-12 mb-4 text-primary' />
                  <h3 className='font-semibold text-center'>{option.label}</h3>
                </CardContent>
              </Card>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
};

export default RadioCardGroup;
