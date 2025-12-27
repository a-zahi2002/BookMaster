import React from 'react';

const BookMasterLogo = ({ size = 'default', className = '' }) => {
    const sizeClasses = {
        small: 'h-8 w-8',
        default: 'h-10 w-10',
        large: 'h-16 w-16',
        xlarge: 'h-24 w-24'
    };

    return (
        <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
            <img
                src="/logo.png"
                alt="BookMaster Logo"
                className="w-full h-full object-cover scale-150"
                style={{ imageRendering: 'crisp-edges' }}
            />
        </div>
    );
};

export default BookMasterLogo;
