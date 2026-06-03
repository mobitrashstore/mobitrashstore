

import React from 'react';
import FAQ from '../components/FAQ';
import MobileSkyHeader from '../components/MobileSkyHeader';
import { ChatBubbleLeftRightIcon } from '../components/icons/ChatBubbleLeftRightIcon';

interface FaqPageProps {
    navigate: (path: string) => void;
}

const FaqPage: React.FC<FaqPageProps> = ({ navigate }) => {
    return (
        <div className="bg-gray-50">
            {/* Disabled spacer and adjusted padding to remove gap */}
            <MobileSkyHeader title="FAQ" Icon={ChatBubbleLeftRightIcon} hasSpacer={false} />
            <div className="pt-20 md:pt-0">
                <FAQ />
            </div>
        </div>
    );
};

export default FaqPage;
