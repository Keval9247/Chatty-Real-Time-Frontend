import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-900">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-400 border-solid rounded-full animate-spin"></div>
        </div>
    );
};

export default Loading;
