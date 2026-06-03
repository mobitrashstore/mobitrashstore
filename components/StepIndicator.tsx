
import React from 'react';
import { CheckIcon } from './icons/CheckIcon';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = ['Device Details', 'Condition', 'Your Quote', 'Complete'];

const Step: React.FC<{ index: number; label: string; currentStep: number }> = ({ index, label, currentStep }) => {
  const isCompleted = currentStep > index;
  const isActive = currentStep === index;

  return (
    <div className="flex items-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
          ${isCompleted ? 'bg-amber-600 text-white' : ''}
          ${isActive ? 'bg-amber-100 text-amber-600 border-2 border-amber-600' : ''}
          ${!isCompleted && !isActive ? 'bg-slate-200 text-slate-500' : ''}`}
      >
        {isCompleted ? <CheckIcon className="w-5 h-5" /> : index + 1}
      </div>
      <span
        className={`ml-3 font-medium transition-colors duration-300
          ${isActive ? 'text-amber-600' : 'text-slate-500'}
          ${isCompleted ? 'text-slate-700 dark:text-slate-200' : ''}`}
      >
        {label}
      </span>
    </div>
  );
};

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-between">
      {steps.map((label, index) => (
        <React.Fragment key={index}>
          <Step index={index} label={label} currentStep={currentStep} />
          {index < steps.length - 1 && <div className="flex-1 h-0.5 bg-slate-200 mx-4"></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
