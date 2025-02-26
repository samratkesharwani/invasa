import React from 'react';

const StatsCard = () => {
    return (
<div style={{backgroundColor:"#111928", padding:"2vw"}} >
<div style={{display: 'grid',placeItems:'center', margin:'2vw 10vw 2vw 10vw',}} >

<h6 className="font-bold mb-3 flex items-center text-lg text-body-color dark:text-dark-6">
                    Onboarded with us till now
                    <span className="ml-3 inline-block h-px w-8 bg-body-color"></span>
                  </h6>
</div>
        <div style={{display: 'grid',placeItems:'center', margin:'2vw 10vw 2vw 10vw',}} >
     <div style={{backgroundColor:'#1F2A37',color:'white', display: 'flex',justifyContent:'space-evenly',alignItems:'center',width:'90%', borderRadius:'20px' }}className="flex justify-between items-center  p-5 rounded-lg w-1/2" >
         <div style={{ marginLeft:"2vw"}} className="text-center m-4">
           <p className="text-2xl font-bold">4+</p>
           <p className="text-sm text-white mb-1">Bangalore</p>
         </div>
         <div style={{ marginLeft:"2vw"}} className="text-center m-4">
           <p className="text-2xl font-bold">4+</p>
           <p className="text-sm text-white mb-1">Pune</p>
         </div> 
         <div style={{ marginLeft:"2vw"}} className="text-center m-4">
           <p className="text-2xl font-bold">1</p>
           <p className="text-sm  text-white mb-1">Lucknow</p>
         </div>
</div>
   </div>
   </div>
 );
};

export default StatsCard;