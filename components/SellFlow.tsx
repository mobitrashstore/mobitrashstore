
import React, { useState, useEffect } from 'react';
import { PhoneDetails, DeclaredCondition, QuoteInput, QuoteResponse, QuoteRejection } from '../types';
import { computeQuote } from '../services/quoteService';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StepIndicator from './StepIndicator';
import PhoneSelector from './PhoneSelector';
import ConditionForm from './ConditionForm';
import QuoteDisplay from './QuoteDisplay';
import TradeInForm from './TradeInForm';

interface SellFlowProps {
  navigate: (path: string) => void;
  initialDetails?: PhoneDetails | null;
  onReset: () => void;
}

const SellFlow: React.FC<SellFlowProps> = ({ navigate, initialDetails = null, onReset }) => {
  const [step, setStep] = useState(0);
  const [phoneDetails, setPhoneDetails] = useState<PhoneDetails | null>(initialDetails);
  const [declaredCondition, setDeclaredCondition] = useState<DeclaredCondition | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (initialDetails) {
      setStep(1); // Skip to condition form if details are pre-filled by AI
    }
  }, [initialDetails]);


  const handlePhoneSelect = (details: PhoneDetails) => {
    setPhoneDetails(details);
    setStep(1);
  };

  const handleConditionSubmit = async (condition: DeclaredCondition) => {
    if (phoneDetails) {
      setDeclaredCondition(condition);
      const quoteInput: QuoteInput = { ...phoneDetails, declared_condition: condition };
      const result = await computeQuote(quoteInput);
      
      if ('rejection' in result) {
        const params = new URLSearchParams({
          reason: result.reason,
          message: result.message
        });
        navigate(`/trade-in-rejected?${params.toString()}`);
      } else {
        setQuote(result);
        setStep(2);
      }
    }
  };
  
  const handleAcceptQuote = () => {
    setStep(3);
  };

  const handleTradeInSubmit = async (userDetails: any) => {
    if (!phoneDetails || !quote) return;
    
    const tradeInDetails = {
      customerName: userDetails.name,
      device: `${phoneDetails.brand} ${phoneDetails.model} ${phoneDetails.storage_gb}GB`,
      quote: quote.calc.calculated_value,
      customerEmail: user?.email || '',
    };

    const newTradeIn = await api.addTradeIn(tradeInDetails);
    
    navigate(`/trade-in-confirmation?id=${newTradeIn.id}`);
  };

  const handleBack = () => {
    if (step > 0) {
      // If started with AI, going back from condition form should reset everything
      if (step === 1 && initialDetails) {
          onReset();
      } else {
          setStep(step - 1);
      }
    }
  };

  const handleReset = () => {
    onReset();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <PhoneSelector onNext={handlePhoneSelect} />;
      case 1:
        return <ConditionForm onBack={handleBack} onNext={handleConditionSubmit} />;
      case 2:
        if (quote) {
          return <QuoteDisplay quote={quote} onBack={handleBack} onReset={handleReset} onAccept={handleAcceptQuote} />;
        }
        return null; // Or some error state
      case 3:
        return <TradeInForm onBack={handleBack} onSubmit={handleTradeInSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-4 sm:p-8 animate-fade-in">
      <div className="mb-8">
        <StepIndicator currentStep={step} />
      </div>
      <div className="bg-black p-6 sm:p-10 rounded-lg shadow-lg border border-gray-700">
        {renderStep()}
      </div>
    </div>
  );
};

export default SellFlow;
