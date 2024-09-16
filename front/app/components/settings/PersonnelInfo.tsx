import React, { useEffect, useState } from "react";
import { setProfileData } from "../../../redux/features/profile/profileSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectProfileInfo } from "../../../redux/features/profile/profileSlice";
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "@nextui-org/react";

export default function PersonnelInfo() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const profileSelector = useSelector(selectProfileInfo);
  const [imagePath, setImagePath] = useState<any>(profileSelector.avatar);
  const [firstName, setFirstName] = useState<string>(
    profileSelector.firstName || ""
  );
  const [lastName, setLastName] = useState<string>(
    profileSelector.lastName || ""
  );
  const [nickName, setNickName] = useState<string>(
    profileSelector.username || ""
  );
  const dispatch = useDispatch();
  const presetKey = "r0th9bpt"; //doit in evn
  const cloudName = "dfcgherll";
  const _api = axios.create();
  console.log("profiledatahere", profileSelector);

  useEffect(() => {
    setIsLoading(false);
  }, [profileSelector]);

  useEffect(() => {
    if (
      profileSelector.firstName &&
      profileSelector.lastName &&
      profileSelector.username
    ) {
      setImagePath(profileSelector.avatar);
      setFirstName(profileSelector.firstName);
      setLastName(profileSelector.lastName);
      setNickName(profileSelector.username);
      setIsLoading2(true);
    }
  }, [profileSelector]);

  const handleAvatarChange = async (e: any) => {
    try {
      setIsLoading(true);
      const file = e.target.files?.[0];
      if (!file) return;
      const formDate = new FormData();
      formDate.append("file", file);
      formDate.append("upload_preset", presetKey);

      const res = await _api.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formDate,
        { withCredentials: false }
      );
      setIsLoading(false);
      const imageUrl = res.data.secure_url;
      setImagePath(imageUrl);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };
  const onSubmit = async () => {
    try {
      if (!firstName.trim() || !lastName.trim() || !nickName.trim()) {
        toast.error("All fields are required");
        return;
      }
      else if (nickName.length > 8) {
        toast.info("Username must be at most 8 characters");
        return;
      }
      else if (firstName.length > 12) {
        toast.info("firstName must be at most 12 characters");
        return;
      }
      else if (lastName.length > 12) {
        toast.info("lastName must be at most 12 characters");
        return;
      }

      const updatedProfileData = {
        id: profileSelector.id,
        firstName: firstName,
        lastName: lastName,
        username: nickName,
        avatar: imagePath || profileSelector.avatar,
      };

      console.log("------------",updatedProfileData.firstName);
      console.log("heeeeere");
      
      const res = await axios.post(
        `http://localhost:4000/user/changeInfos`,
        updatedProfileData
        );
        console.log("------------heloo",res.data);
        
        dispatch(setProfileData(updatedProfileData));
      console.log("------------heloo22",res);
      toast.success("Your information has been changed successfully");
    } catch (error:any) {
      if (error.response.status === 400 || error.response.status === 401) {
          console.error("Error: ", error.response.data.message);
          toast.error(`Error: ${error.response.data.message}`);
      } else {
          console.error("Error: ", error.message);
      }
    }
  };

  return !isLoading2 ? (
    <div>
      <Skeleton className="flex rounded-full w-[100px] h-[100px]" />
    </div>
  ) : (
    <div className="flex flex-col justify-between h-[90%]">
      <div className="">
        <h2 className="text-[#252f5b] font-poppins text-xl font-semibold text-center">
          Personal information
        </h2>
      </div>
      <div className="w-full flex items-center justify-center">
        <div className="relative">
          <label
            htmlFor="upload"
            className=" cursor-pointer z-50 absolute top-0 right-0"
          >
            <img
              id="imageUpload"
              src="/changeicon.svg"
              className=" transform hover:scale-125 transition-transform duration-300"
            />
          </label>
          <input
            name="avatar"
            type="file"
            id="upload"
            className="absolute hidden cursor-pointer"
            onChange={handleAvatarChange}
            accept="image/*"
          />
          {isLoading ? (
            <div>
              <Skeleton className="flex rounded-full w-[100px] h-[100px]" />
            </div>
          ) : (
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
              <img
                src={`${imagePath}`}
                alt={`${profileSelector.avatar}`}
                id="avatar"
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
      </div>
      <div className="w-full flex flex-col gap-[24px]  rounded-[8px] px-[60px] ">
        <div className="flex w-full gap-[24px] flex-col md:flex-row">
          <div className="w-full relative bg-inherit border-[1px] border-[#c9c9c9] rounded-[10px]">
            <input
              type="text"
              onChange={(e) => setFirstName(e.target.value)}
              defaultValue={profileSelector.firstName}
              id="firstName"
              className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer`}
              placeholder=" "
            />
            <label
              htmlFor="firstName"
              className={
                profileSelector.firstName
                  ? `absolute text-sm text-[#c9c9c9] dark:text-[#c9c9c9] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#c9c9c9] peer-focus:dark:text-[#c9c9c9] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto`
                  : `absolute text-sm text-[#c9c9c9] dark:text-red-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#c9c9c9] peer-focus:dark:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto`
              }
            >
              Firstname
            </label>
          </div>
          <div className="w-full relative bg-inherit border-[1px] border-[#c9c9c9] rounded-[10px] ">
            <input
              type="text"
              onChange={(e) => setLastName(e.target.value)}
              defaultValue={profileSelector.lastName}
              id="lastName"
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500        focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
            />
            <label
              htmlFor="lastName"
              className="absolute text-sm text-[#c9c9c9] dark:text-[#c9c9c9] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#c9c9c9] peer-focus:dark:text-[#c9c9c9] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
            >
              Last name
            </label>
          </div>
        </div>
        <div className="w-full md:w-[47%] xl:w-[48.5%] relative bg-inherit border-[1px] border-[#c9c9c9] rounded-[10px]">
          <input
            type="text"
            onChange={(e) => setNickName(e.target.value)}
            defaultValue={profileSelector.username}
            id="username"
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500        focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
          />
          <label
            htmlFor="username"
            className={
              profileSelector.username
                ? `absolute text-sm text-[#c9c9c9] dark:text-[#c9c9c9] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#c9c9c9] peer-focus:dark:text-[#c9c9c9] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto`
                : `absolute text-sm text-[#c9c9c9] dark:text-red-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-[#c9c9c9] peer-focus:dark:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto`
            }
          >
            Nickname
          </label>
        </div>
      </div>
      <div className="flex gap-4 flex-col justify-center items-center  sm:flex-row sm:justify-end px-[60px] w-full">
        <button
          className="w-32 h-10 bg-[#909DC8] text-white rounded-lg hover:bg-[#98a9dc]"
          onClick={() => onSubmit()}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
