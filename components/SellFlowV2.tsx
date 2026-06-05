import React, { useState } from 'react';
import NewStepIndicator from './NewStepIndicator';
import SelectBrandStep from './steps/SelectBrandStep';
import SelectModelStep from './steps/SelectModelStep';
import FeaturesStep from './steps/FeaturesStep';
import QnAStep from './steps/QnAStep';
import PhotoUploadStep from './steps/PhotoUploadStep';
import OtpStep from './steps/OtpStep';
import PriceDisplayStep from './steps/PriceDisplayStep';
import * as api from '../services/api';
import { QuoteResponse, SellModel, DeclaredCondition } from '../types';
import { PRICE_BASELINE } from '../constants';
import { sendEmail, getSellOfferEmailTemplate } from '../services/email';

interface SellFlowV2Props {
  navigate: (path: string) => void;
  onStepChange?: (step: number) => void;
}

interface DeviceDetailsState {
    brand: string;
    model: string;
    ram_gb: number;
    storage_gb: number;
    imageUrl: string;
    storageOptions?: string[];
}

const SellFlowV2: React.FC<SellFlowV2Props> = ({ navigate, onStepChange }) => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetailsState>({
    brand: '',
    model: '',
    ram_gb: 0,
    storage_gb: 0,
    imageUrl: '',
    storageOptions: []
  });
  const [features, setFeatures] = useState<{
      variant: string;
      imei: string;
      age: string;
      powersOn: boolean;
  } | null>(null);
  const [qnaAnswers, setQnaAnswers] = useState(null);
  const [customerDetails, setCustomerDetails] = useState<{
      fullName: string;
      address: string;
      phone: string;
      email: string;
  } | null>(null);
  const [deviceImages, setDeviceImages] = useState<string[]>([]);

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  const nextStep = () => {
      window.scrollTo({ top: 0 });
      setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
      window.scrollTo({ top: 0 });
      setStep(prev => prev > 0 ? prev - 1 : 0);
  };

  const startOver = () => {
    setStep(0);
    setDeviceDetails({ brand: '', model: '', ram_gb: 0, storage_gb: 0, imageUrl: '', storageOptions: [] });
    setFeatures(null);
    setQnaAnswers(null);
    setCustomerDetails(null);
    setDeviceImages([]);
    setUploadedImageUrls([]);
    setIsUploading(false);
    window.scrollTo({ top: 0 });
  }

  const handleBrandSelected = (brand: string) => {
    setDeviceDetails({ brand: brand, model: '', ram_gb: 0, storage_gb: 0, imageUrl: '', storageOptions: [] });
    nextStep();
  };

  const handleModelSelected = (model: SellModel) => {
    setDeviceDetails(prev => ({ 
        ...prev, 
        model: model.name, 
        imageUrl: model.imageUrl,
        storageOptions: model.storageOptions || []
    }));
    nextStep();
  };

  const handleFeaturesSubmitted = (data: any) => {
      setFeatures(data);
      const variantStr = data.variant || '';
      let storage = 0;
      let ram = 0;
      
      if (variantStr.includes('/')) {
          const parts = variantStr.split('/');
          ram = parseInt(parts[0].replace(/\D/g, ''), 10) || 0;
          storage = parseInt(parts[parts.length - 1].replace(/\D/g, ''), 10) || 0;
      } else {
          storage = parseInt(variantStr.replace(/\D/g, ''), 10) || 0;
          const variantInfo = PRICE_BASELINE.find(
              p => p.brand === deviceDetails.brand && 
                   p.model === deviceDetails.model && 
                   p.storage_gb === storage
          );
          ram = variantInfo?.ram_gb || 0;
      }

      setDeviceDetails(prev => ({...prev, storage_gb: storage, ram_gb: ram}));
      nextStep();
  }
  
  const handleQnaSubmitted = (data: any) => {
    setQnaAnswers(data);
    nextStep();
  }

  const handlePhotosSubmitted = async (images: string[]) => {
    setDeviceImages(images);
    setUploadedImageUrls(images);
    nextStep();
  };

  const handleOtpVerified = (details: any) => {
    setCustomerDetails(details);
    nextStep();
  };
  
  const handleAcceptAndSubmit = (quote: QuoteResponse, condition: DeclaredCondition) => {
    if (!customerDetails || !deviceDetails || !('calc' in quote) || isSubmitting) return;

    // --- STEP 1: INSTANT UI SUCCESS (NO WAITING) ---
    setStep(99); 
    setSubmissionProgress(100);
    
    const rootEl = document.getElementById('root');
    if (rootEl) rootEl.scrollTo({ top: 0, behavior: 'smooth' });

    // --- STEP 2: PREPARE PAYLOAD (USE BASE64 IF STORAGE NOT READY) ---
    // If background upload hasn't finished, we just send the base64 strings directly.
    // Since images are now compressed to ~25KB, this is safe and Bullet Fast.
    const finalImagesToSubmit = uploadedImageUrls.length > 0 ? uploadedImageUrls : deviceImages;
    const deviceName = `${deviceDetails.brand} ${deviceDetails.model} ${deviceDetails.storage_gb}GB`;

    const tradeInPayload = {
        customerName: customerDetails.fullName,
        customerEmail: customerDetails.email,
        device: deviceName,
        quote: quote.calc.calculated_value, 
        condition: condition, 
        deviceImages: finalImagesToSubmit
    };

    // --- STEP 3: FIRE-AND-FORGET BACKGROUND TASKS ---
    setIsSubmitting(true);
    api.addTradeIn(tradeInPayload)
       .catch(e => console.error("Database write failed in background", e))
       .finally(() => setIsSubmitting(false));
    
    const emailParams = {
        customerName: customerDetails.fullName,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        device: deviceName,
        quote: quote.calc.calculated_value,
        status: 'Accepted' as const,
        imageUrl: deviceDetails.imageUrl
    };

    // 1. Send to Customer
    sendEmail({
        to: customerDetails.email,
        subject: `Sell Offer Accepted: ${deviceName}`,
        body: getSellOfferEmailTemplate(emailParams)
    }).catch(e => console.error("Customer sell email failed", e));

    // 2. Send to Admin
    sendEmail({
        to: 'mobistorestore@gmail.com',
        subject: `NEW OFFER ACCEPTED: ${customerDetails.fullName}`,
        body: getSellOfferEmailTemplate({ ...emailParams, isAdminView: true })
    }).catch(e => console.error("Admin sell email failed", e));

    // Auto-navigate home after the user sees the success state
    setTimeout(() => {
        navigate('/');
    }, 5000); 
  };

  const handleDecline = async (quote: QuoteResponse, condition: DeclaredCondition) => {
    if (!customerDetails || !deviceDetails || !('calc' in quote)) return;

    const deviceName = `${deviceDetails.brand} ${deviceDetails.model} ${deviceDetails.storage_gb}GB`;
    
    // Send email to customer even if they decline (as requested)
    sendEmail({
        to: customerDetails.email,
        subject: `Sell Offer Declined: ${deviceName}`,
        body: getSellOfferEmailTemplate({
            customerName: customerDetails.fullName,
            customerEmail: customerDetails.email,
            customerPhone: customerDetails.phone,
            device: deviceName,
            quote: quote.calc.calculated_value,
            status: 'Declined' as const,
            imageUrl: deviceDetails.imageUrl
        })
    }).catch(e => console.error("Decline email failed", e));

    alert('Your decision has been noted. We hope to serve you again in the future!');
    startOver();
  };

  const renderStepComponent = () => {
    switch(step) {
      case 0:
        return <SelectBrandStep onNext={handleBrandSelected} />;
      case 1:
        return <SelectModelStep brand={deviceDetails.brand} onBack={prevStep} onNext={handleModelSelected} />;
      case 2:
        return <FeaturesStep deviceDetails={deviceDetails} onBack={prevStep} onNext={handleFeaturesSubmitted} />;
      case 3:
        return <QnAStep deviceDetails={deviceDetails} onBack={prevStep} onNext={handleQnaSubmitted} />;
      case 4:
        return <PhotoUploadStep onBack={prevStep} onNext={handlePhotosSubmitted} />;
      case 5:
        return <OtpStep onBack={prevStep} onNext={handleOtpVerified} />;
      case 6:
        if (features && qnaAnswers) {
             return <PriceDisplayStep 
                        deviceDetails={deviceDetails} 
                        features={features} 
                        qnaAnswers={qnaAnswers}
                        customerDetails={customerDetails}
                        onAcceptAndSubmit={handleAcceptAndSubmit}
                        onDecline={handleDecline}
                        onStartOver={startOver}
                        isSubmitting={isSubmitting}
                        submissionProgress={submissionProgress}
                    />;
        }
        return <p>Loading...</p>;
       case 99:
        return (
            <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">Offer Accepted!</h3>
                <p className="text-slate-600 max-w-sm mx-auto">Your trade-in has been submitted successfully. Our agent will call you shortly to schedule your pickup.</p>
                <button 
                  onClick={() => { startOver(); navigate('/'); }} 
                  className="mt-10 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                >
                  Return to Home
                </button>
            </div>
        );
      default:
        return (
            <div className="text-center py-10">
                <h3 className="text-xl font-semibold">Thank you!</h3>
                <p className="text-gray-600">Your trade-in has been submitted. We will be in touch shortly.</p>
                <button onClick={startOver} className="mt-4 px-4 py-2 bg-gray-200 rounded-md">Start Over</button>
            </div>
        );
    }
  };

  return (
    <div className="w-full">
      <NewStepIndicator currentStep={step} />
      <div className="p-4 md:p-10 bg-white min-h-[400px]">
        {renderStepComponent()}
      </div>
    </div>
  );
};

export default SellFlowV2;
