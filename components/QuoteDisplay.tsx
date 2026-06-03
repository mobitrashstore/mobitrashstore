
import React from 'react';
import { QuoteResponse } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';

interface QuoteDisplayProps {
  quote: QuoteResponse;
  onBack: () => void;
  onReset: () => void;
  onAccept: () => void;
}

const deductionExplanations: { [key: string]: string } = {
  'powers_on_false': 'Device does not power on, indicating significant internal issues.',
  'not_unlocked_or_mdms_registered': 'Device is either network-locked or not registered with MDMS, limiting its usability.',
  'screen_cracks_hairline': 'Fine, spider-web like cracks on the screen glass.',
  'screen_cracks_major': 'Deep or multiple cracks on the screen that may affect touch functionality.',
  'lcd_damage_lines': 'Visible lines or patterns on the display, indicating damage to the LCD panel.',
  'lcd_damage_black_spots': 'Black spots or dead pixels on the display from internal screen damage.',
  'water_damage_tripped': 'The internal water damage indicator has been activated, suggesting moisture exposure.',
  'battery_lt_70': 'Battery health is significantly degraded, requiring replacement for normal use.',
  'battery_lt_80': 'Battery health is below optimal, impacting daily usage duration.',
  'face_id_touch_id_faulty': 'Biometric authentication (Face ID or Touch ID) is not functioning correctly.',
  'back_glass_cracked': 'The rear glass panel of the phone is cracked or shattered.',
  'minor_scratches': 'Visible cosmetic scratches on the screen or body.',
  'buttons_faulty': 'One or more physical buttons (power, volume) are not working correctly.',
  'camera_faulty': 'Issues with the front or rear camera, such as spots, blurriness, or not opening.',
  'age_penalty': 'Deduction based on the age of the device, reflecting natural depreciation.'
};


const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ quote, onBack, onReset, onAccept }) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-white mb-2">Here's Your Instant Quote!</h2>
      <p className="text-center text-slate-500 mb-8">{quote.brand} {quote.model} - {quote.storage_gb}GB</p>

      <div className="bg-amber-900/50 border-2 border-amber-500 rounded-lg p-8 text-center my-8">
        <p className="text-lg font-medium text-amber-300">Estimated Value</p>
        <h3 className="text-4xl sm:text-5xl font-extrabold text-amber-400 mt-2">
          NPR {quote.estimate_min.toLocaleString()} - {quote.estimate_max.toLocaleString()}
        </h3>
        <p className="mt-4 text-sm text-amber-300">{quote.calc.notes}</p>
      </div>

      {quote.calc.deductions.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-2">Quote Breakdown</h4>
          <div className="border border-gray-700 rounded-lg p-4 space-y-2 text-sm bg-gray-900">
            <div className="flex justify-between font-semibold">
              <span>Baseline Value</span>
              <span>NPR {quote.calc.baseline.toLocaleString()}</span>
            </div>
            {quote.calc.deductions.map((deduction, index) => (
              <div key={index} className="flex justify-between items-center text-rose-400">
                <span className="flex items-center gap-2 capitalize">
                  {deduction.reason.replace(/_/g, ' ')} ({deduction.value}%)
                  <span className="group relative">
                    <InformationCircleIcon className="w-4 h-4 text-slate-400 cursor-pointer" />
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 text-xs bg-slate-700 text-white p-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {deductionExplanations[deduction.reason] || "Deduction for condition."}
                    </span>
                  </span>
                </span>
                <span>- NPR {Math.round(deduction.amount).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold border-t border-gray-700 pt-2 mt-2 text-slate-200">
              <span>Final Calculated Value</span>
              <span>NPR {Math.round(quote.calc.calculated_value).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-1/4 flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-600 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Back
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-1/4 flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-600 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Start Over
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="w-full sm:w-1/2 bg-amber-600 text-white font-bold py-3 px-4 rounded-md hover:bg-amber-700 transition-colors"
        >
          Accept & Continue
        </button>
      </div>
    </div>
  );
};

export default QuoteDisplay;
