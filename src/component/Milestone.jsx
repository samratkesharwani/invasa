import React from 'react';

const StatsCard = ({isDarkMode}) => {
    return (
<div className={`${isDarkMode ? 'bg-dark' : 'bg-[#f8f9fa]'}`}>
<div style={{display: 'grid', placeItems:'center', margin:'2vw 10vw 2vw 10vw'}} >
  <h6 className={`font-bold mb-3 flex items-center text-lg ${isDarkMode ? 'text-white' : 'text-black'}`}>
    Milestone
    <span className="ml-3 inline-block h-px w-8 -body-color"></span>
  </h6>
</div>

<div style={{display: 'grid', placeItems:'center', margin:'2vw 10vw 2vw 10vw'}} >
  <div 
    className={`flex justify-center items-center p-6 rounded-lg w-full md:w-3/4 lg:w-2/3 ${isDarkMode ? 'bg-[#1F2A37] border border-gray-800' : 'bg-white border border-gray-200'}`}
    style={{
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}
  >
    <div className="grid grid-cols-3 gap-4 w-full">
      <div 
        className={`flex flex-col items-center justify-center p-5 rounded-lg ${isDarkMode ? 'bg-dark-2 border border-gray-700' : 'bg-[#f8f9fa] border border-gray-200'}`}
        style={{
          transition: 'transform 0.3s ease',
          borderRadius: '8px'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <p className={`${isDarkMode ? 'text-white' : 'text-black'} text-2xl font-bold`}>4+</p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bangalore</p>
      </div>

      <div 
        className={`flex flex-col items-center justify-center p-5 rounded-lg ${isDarkMode ? 'bg-dark-2 border border-gray-700' : 'bg-[#f8f9fa] border border-gray-200'}`}
        style={{
          transition: 'transform 0.3s ease',
          borderRadius: '8px'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <p className={`${isDarkMode ? 'text-white' : 'text-black'} text-2xl font-bold`}>4+</p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pune</p>
      </div>

      <div 
        className={`flex flex-col items-center justify-center p-5 rounded-lg ${isDarkMode ? 'bg-dark-2 border border-gray-700' : 'bg-[#f8f9fa] border border-gray-200'}`}
        style={{
          transition: 'transform 0.3s ease',
          borderRadius: '8px'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <p className={`${isDarkMode ? 'text-white' : 'text-black'} text-2xl font-bold`}>1</p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lucknow</p>
      </div>
    </div>
  </div>
</div>
</div>
);
};

export default StatsCard;