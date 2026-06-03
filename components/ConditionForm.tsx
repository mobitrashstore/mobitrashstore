import React, { useState } from 'react';
import { DeclaredCondition } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface ConditionFormProps {
  onBack: () => void;
  onNext: (condition: DeclaredCondition) => void;
}

const ConditionForm: React.FC<ConditionFormProps> = ({ onBack, onNext }) => {
  const [condition, setCondition] = useState<DeclaredCondition>({
    powers_on: true,
    screen_cracks: 'none',
    lcd_damage: 'none',
    water_damage: 'none',
    battery_health_pct: 90,
    face_id_touch_id: 'ok',
    back_glass: 'ok',
    buttons: 'ok',
    camera: 'ok',
    imei_status: 'clean',
    factory_unlocked_mdms_free: true,
    age_months: 6,
    minor_scratches: false,
  });

  const handleChange = (field: keyof DeclaredCondition, value: any) => {
    setCondition(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(condition);
  };
  
  type RadioOptionProps<T> = {
    field: keyof DeclaredCondition;
    value: T;
    label: string;
    currentValue: T;
  };

  const RadioOption = <T extends string | boolean>({ field, value, label, currentValue }: RadioOptionProps<T>) => (
    <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${currentValue === value ? 'border-amber-600 bg-amber-900/50' : 'border-gray-600 hover:border-amber-500'}`}>
      <input
        type="radio"
        name={field as string}
        checked={currentValue === value}
        onChange={() => handleChange(field, value)}
        className="sr-only"
      />
      <span className="font-medium">{label}</span>
    </label>
  );

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-white mb-2">Device Condition</h2>
      <p className="text-center text-slate-500 mb-8">Be honest for the most accurate quote. We'll verify this later.</p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1 */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-white mb-2">Does it power on?</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <RadioOption field="powers_on" value={true} label="Yes" currentValue={condition.powers_on} />
                        <RadioOption field="powers_on" value={false} label="No" currentValue={condition.powers_on} />
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-medium text-white mb-2">Screen Condition</h3>
                    <div className="grid grid-cols-1 gap-2">
                        <RadioOption field="screen_cracks" value="none" label="No cracks" currentValue={condition.screen_cracks} />
                        <RadioOption field="screen_cracks" value="hairline" label="Hairline cracks" currentValue={condition.screen_cracks} />
                        <RadioOption field="screen_cracks" value="major" label="Major cracks" currentValue={condition.screen_cracks} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-medium text-white mb-2">Back Glass</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <RadioOption field="back_glass" value="ok" label="Not cracked" currentValue={condition.back_glass} />
                        <RadioOption field="back_glass" value="cracked" label="Cracked" currentValue={condition.back_glass} />
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-medium text-white mb-2">Battery Health</h3>
                     <input
                        type="range"
                        min="0"
                        max="100"
                        value={condition.battery_health_pct}
                        onChange={(e) => handleChange('battery_health_pct', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                     <p className="text-center text-slate-500 mb-2 text-sm">{'Check in Settings > Battery > Battery Health.'}</p>
                    <div className="text-center font-bold text-amber-600 mt-2">{condition.battery_health_pct}%</div>
                </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-white mb-2">Face ID / Touch ID</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <RadioOption field="face_id_touch_id" value="ok" label="Works" currentValue={condition.face_id_touch_id} />
                        <RadioOption field="face_id_touch_id" value="faulty" label="Faulty" currentValue={condition.face_id_touch_id} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-medium text-white mb-2">Unlocked & MDMS Free?</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <RadioOption field="factory_unlocked_mdms_free" value={true} label="Yes" currentValue={condition.factory_unlocked_mdms_free} />
                        <RadioOption field="factory_unlocked_mdms_free" value={false} label="No" currentValue={condition.factory_unlocked_mdms_free} />
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-medium text-white mb-2">Device Age (Months)</h3>
                     <input
                        type="number"
                        min="0"
                        max="60"
                        value={condition.age_months}
                        onChange={(e) => handleChange('age_months', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-600 bg-gray-800 rounded-md"
                    />
                </div>
            </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-600 transition-colors"
            >
                <ChevronLeftIcon className="w-5 h-5" />
                Back
            </button>
            <button
                type="submit"
                className="w-full sm:w-auto flex-grow bg-amber-600 text-white font-bold py-3 px-4 rounded-md hover:bg-amber-700 transition-colors"
            >
                Get My Quote
            </button>
        </div>
      </form>
    </div>
  );
};

export default ConditionForm;
