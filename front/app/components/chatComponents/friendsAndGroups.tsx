import CreateGroupChat from './groupChat/createGroupChat';
import JoinGroupChat from './groupChat/joinGroupChat';
import { RootState } from '@/redux/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { setCreateGroup } from '@/redux/features/chatSlices/create_join_GroupSlice';
import { setJoinGroup } from '@/redux/features/chatSlices/create_join_GroupSlice';
import { setGroupOptions } from '@/redux/features/chatSlices/create_join_GroupSlice';
import Convos from './convos';

export default function FriendsAndGroups(props: any) {

  const dispatch = useDispatch();
  const createGroup = useSelector((state: RootState) => state.group.createGroup);
  const joinGroup = useSelector((state: RootState) => state.group.joinGroup);
  const groupOptions = useSelector((state: RootState) => state.group.groupOptions);

  return (
    <div className='flex w-0 relative border-r-[2px] bg-[#fafcff]  md:w-[300px] lg:w-[400px] h-screen transition-all duration-500   no-scrollbar'>

      <div className='md:block hidden w-[400px] overflow-y-auto overflow-x-hidden no-scrollbar'>
        {createGroup && (<CreateGroupChat />)}
        {joinGroup && (<JoinGroupChat />)}

        <div className='mt-4 w-full h-[114px] flex items-center relative border-b-2'>
          <img className='h-[50px] w-[50px] object-contain ml-1' src={"../../../mini-luffy.jpeg"} alt="../../../mini-luffy.jpeg" />
          <div className='chattxt ml-4 font-light text-[36px] text-[#6e7aaa] text-opacity-100'>Chat</div>
          <div className='active:bg-[#c2c2c2] active:bg-opacity-[60%] absolute right-[8px] rounded-[20px]'> <button onClick={() => dispatch(setGroupOptions(!groupOptions))} className='w-[50px] h-[50px] flex items-center justify-center'> <img src="../../../3no9at.svg" alt="../../../3no9at.svg" /> </button> </div>
          {groupOptions && (
            <div className='rounded-[20px] w-[200px] h-[140px] top-[75px] right-6 absolute mr-[10px] flex flex-col items-center justify-evenly border-[1px] bg-white'>
              <button onClick={() => { dispatch(setCreateGroup(true)); dispatch(setGroupOptions(false)) }} className=' font-normal text-[22px] hover:text-[#7583b9] text-[#4e5c95] font-sans-only flex justify-center items-center hover:border-l hover:border-r border-white rounded-tr-[20px] rounded-tl-[20px] gap-[10px]'> <img src="../../../creatg.svg" alt="../../../creatg.svg" /> New Group</button>
              <button onClick={() => { dispatch(setJoinGroup(true)), dispatch(setGroupOptions(false)) }} className='hover:text-[#7583b9] font-normal text-[22px] font-sans-only text-[#4e5c95] flex justify-center items-center hover:border-l hover:border-r border-white rounded-br-[20px] rounded-bl-[20px] gap-[10px]'>
                <img src="../../../addf.svg" alt="../../../addf.svg" />
                Join Group</button>
            </div>
          )}
        </div>
        <div className='mt-[25px] w-[100%] flex flex-col items-center'>
          <Convos />
        </div>
      </div>
    </div>
  )
}

