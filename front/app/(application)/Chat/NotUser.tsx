import Link from 'next/link'

export default function NotUser() {
    return (
        <div className='h-screen flex flex-col justify-center items-center w-screen bg-center bg-[#dbe0f6] z-[1001] absolute'>
            <div>
                <div className='flex justify-center items-center '>

                <div className="text-[#252f5b] text-[200px] font-bold">4</div>
                <div className='flex items-center justify-center w-[120px] h-[120px] bg-[#D2E5F5] rounded-full shadow-notmember bg-cover' style={{backgroundImage: `url(/giphyluu.gif)`}}>
                
                </div>
                <div className="text-[#252f5b] text-[200px] font-bold ">4</div>
                </div>
            </div>
                <div className='flex flex-col items-center justify-center gap-[26px]'>
                    <Link href='/Chat' className='text-[#FFF] text-[14px] max-w-[481px] font-sans  font-[600] text-center bg-[#252f5b] py-[19px] px-[35px] rounded-[18px] hover:bg-[#3a467a]' >
                        Go back To Chat
                    </Link>
                </div>
        </div>
    )
}