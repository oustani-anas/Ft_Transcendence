import React from 'react'

export default function CloseAccont() {
    return (
        <div className='bg-white lg:w-[130%] lg:h-[22vh] md:w-[100%] md:h-[22vh] sm:h-[26vh] rounded-xl lg:mt-[5%] md:mt-[13%]  lg:ml-[8%] mt-[4%] mb-3 h-[20vh]'>
            <div className='p-[3%]'>
                <h2 className="text-[#5F5F5F] font-poppins text-lg font-semibold">Close account</h2>
            </div>
            <div className="flex flex-col md:flex-col items-center md:space-x-4">
                <div className='p-[2%]'>
                    <p className="text-[#7D8493] font-poppins text-base font-normal">You can permanently delete or temporarily freeze your account.</p>
                </div>
                <div>
                    <button className="bg-[#BCC1C5] text-white px-4 py-2 rounded-md lg:w-[165px] lg:h-[55px] lg:ml-[-12%]  md:mt-[1%] mt-[-8%] lg:mt-[-5%] mb-[19%]">Close Account</button>
                </div>
            </div>

        </div>
    )
}
