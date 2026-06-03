
import React, { useEffect, useRef } from 'react';
import { DevicePhoneMobileIcon } from './icons/DevicePhoneMobileIcon';
import { DeviceMobileIcon } from './icons/DeviceMobileIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { TagIcon } from './icons/TagIcon';

interface NewStepIndicatorProps {
  currentStep: number;
}

const steps = [
    { label: 'Brand', icon: DevicePhoneMobileIcon },
    { label: 'Model', icon: DeviceMobileIcon },
    { label: 'Specs', icon: Cog6ToothIcon },
    { label: 'Condition', icon: QuestionMarkCircleIcon },
    { label: 'Verify', icon: UserCircleIcon },
    { label: 'Quote', icon: TagIcon }
];

const Step: React.FC<{
    Icon: React.ElementType;
    label: string;
    index: number;
    currentStep: number;
    isLast: boolean;
}> = ({ Icon, label, index, currentStep, isLast }) => {
    const isActive = index === currentStep;
    const isCompleted = index < currentStep;

    return (
        <div className="relative flex-1 flex flex-col items-center min-w-[55px] sm:min-w-[70px]">
            
            {/* Connecting Line */}
            {!isLast && (
                 <div className="absolute top-3.5 sm:top-5 left-[50%] w-full h-[2px] bg-slate-100 -z-0">
                     <div className={`h-full bg-amber-500 transition-all duration-500 ease-out`} style={{width: isCompleted ? '100%' : '0%'}}/>
                 </div>
            )}

            {/* Icon Circle */}
            <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 border-2 ${
                isActive ? 'bg-white border-amber-500 text-amber-500 shadow-lg scale-110' : 
                isCompleted ? 'bg-amber-500 border-amber-500 text-white' : 
                'bg-slate-50 border-slate-200 text-slate-300'
            }`}>
                <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            
            {/* Label */}
            <p className={`mt-1.5 sm:mt-2 text-[9px] sm:text-xs font-bold uppercase tracking-wide transition-colors duration-300 text-center ${
                isActive ? 'text-amber-600' :
                isCompleted ? 'text-slate-800' :
                'text-slate-300'
            }`}>
                {label}
            </p>
        </div>
    );
};

const NewStepIndicator: React.FC<NewStepIndicatorProps> = ({ currentStep }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
        const activeElement = scrollContainerRef.current.children[currentStep] as HTMLElement;
        if (activeElement) {
            activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }
  }, [currentStep]);

  return (
    <div className="bg-white border-b border-slate-100 px-2 sm:px-4 py-4 sm:py-6">
        <div 
            ref={scrollContainerRef}
            className="w-full flex items-center justify-between overflow-x-auto scrollbar-hide max-w-3xl mx-auto gap-1"
        >
            {steps.map((step, index) => (
                <Step 
                    key={index}
                    Icon={step.icon}
                    label={step.label}
                    index={index}
                    currentStep={currentStep}
                    isLast={index === steps.length - 1}
                />
            ))}
        </div>
    </div>
  );
};

export default NewStepIndicator;
