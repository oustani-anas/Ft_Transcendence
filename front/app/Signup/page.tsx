'use client'
import Link from "next/link";
import { env } from "process";
import React from "react";
import { useState } from "react";

function Signup() {

  const [email, setemail] = useState<string>("");

  const [isValid, setIsValid] = useState<boolean>(true);


  const validateEmail = (input: string) => {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(input));
  }

  const [password, setPassword] = useState("");
  const [isvalid, setPIsValid] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const validatePassword = (input: any) => {
    setPIsValid(passwordRegex.test(input));
  };

  // const [showInfo, setShowInfo] = useState(false);
  return (

    <div className="grid place-items-center h-screen">
      <form className="bg-[#6E7AAE] w-full sm:w-96 md:w-120 lg:w-2/3 xl:w-[56%] p-8 border border-gray-300 rounded-lg">
        <div className="flex flex-col md:flex-row justify-center items-center">
          <div className="w-[35%] md:hidden ">
            <img src="./images/ping_pong.png" alt="logo" className="w-[150px] h-[100px]" />
          </div>
          <div className="hidden md:block">
            <img src="./images/ping_pong.png" alt="logo" className="w-[150px] h-[100px]" />
          </div>
          <h2 className="text-[#C9C9C9] font-serif text-3xl mt-6">Create Account</h2>
        </div>

        <div className="grid grid-cols-2 md:gap-5">
  <div className="self-center col-span-2 md:col-span-1 relative bg-inherit border-[1px] border-[#c9c9c9] rounded-[10px] w-full mb-4">
    <input
      type="text"
      id="firstname"
      className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      placeholder=" "
    />
    <label
      htmlFor="firstname"
      className="absolute text-sm text-[#c9c9c9] dark:text-[#c9c9c9] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#6E7AAE] px-2 peer-focus:px-2 peer-focus:text-[#c9c9c9] peer-focus:dark:text-[#c9c9c9] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
    >
      First Name
    </label>
  </div>
  <div className="self-center col-span-2 md:col-span-1 relative bg-inherit border-[1px] border-[#c9c9c9] rounded-[10px] w-full mb-4">
    <input
      type="text"
      id="lastname"
      className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      placeholder=" "
    />
    <label
      htmlFor="lastname"
      className="absolute text-sm text-[#c9c9c9] dark:text-[#c9c9c9] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#6E7AAE] px-2 peer-focus:px-2 peer-focus:text-[#c9c9c9] peer-focus:dark:text-[#c9c9c9] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
    >
      Last Name
    </label>
  </div>
</div>


        <div className="self-center col-span-2 relative bg-inherit border-[1px] border-[#c9c9c9] rounded-[10px] w-full mb-4">
          <input
            type="email"
            id="email"
            className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent
             rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500        
             focus:outline-none focus:ring-0 focus:border-blue-600 peer input-field ${!isValid && email !== "" ? "border-red-500" : ""}`}
            placeholder=" "
            value={email}
            onChange={(event) => {
              setemail(event.target.value);
              validateEmail(event.target.value);
            }}
          />
          <label htmlFor="email" className="absolute text-sm text-[#c9c9c9] dark:text-[#c9c9c9] duration-300 transform -translate-y-4 scale-75 
          top-2 z-10 origin-[0] bg-[#6E7AAE] px-2 peer-focus:px-2 peer-focus:text-[#c9c9c9] peer-focus:dark:text-[#c9c9c9]
           peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 
          peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 
          peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
            Email
          </label>

        </div>
        {!isValid && email !== "" && (
          <p className="text-red-300 text-xs absolut">Invalid email format!!</p>
        )}

        <div>
          <p className="text-xs text-[#d8d1a5] mb-[3px]">
            Password rules: at least 8 characters - One uppercase - One special character - One number
          </p>
          <div className="self-center col-span-2 relative bg-inherit border-[1px] border-[#c9c9c9] rounded-[10px] w-full mb-4">
            <input
              type="password"
              id="password"
              className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent
              rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500        
              focus:outline-none focus:ring-0 focus:border-blue-600 peer input-field input-field ${!isvalid && password !== "" ? "border-red-500" : ""}`}
              placeholder=" "
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                validatePassword(event.target.value);
              }}
            />
         
            <label htmlFor="password" className="absolute text-sm text-[#c9c9c9] dark:text-[#c9c9c9] duration-300 transform -translate-y-4 scale-75 
          top-2 z-10 origin-[0] bg-[#6E7AAE] px-2 peer-focus:px-2 peer-focus:text-[#c9c9c9] peer-focus:dark:text-[#c9c9c9]
           peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 
          peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 
          peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">
              Password
            </label>
          </div>

        </div>
        {!isvalid && password !== "" && (
          <p className="text-red-300 text-xs mb-3">Invalid password</p>
        )}
       

        <div className="self-center col-span-2 relative bg-inherit border-[1px] border-[#c9c9c9] rounded-[10px] w-full mb-4">
          <input type="password" id="cPassword" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500        focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
          <label htmlFor="cPassword" className="absolute text-sm text-[#c9c9c9] dark:text-[#c9c9c9] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#6E7AAE] px-2 peer-focus:px-2 peer-focus:text-        [#c9c9c9] peer-focus:dark:text-[#c9c9c9] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 peer-focus:-translate-y-4 start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"> Confirme Password</label>
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-[#DFB97F] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create Account
          </button>
        </div>

        <div className="text-center border-b-[1px] leading-[0.1em] border-b-[#c9c9c9] mt-4">
          <span className="bg-[#6E7AAE] px-4 text-[#c9c9c9]">or</span>
        </div>

        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-4">
          <button className="flex-grow md:w-1/2 border border-gray-300 text-gray-900 py-2 px-4 rounded hover:bg-indigo-500 flex items-center">
            <img src="./images/google_logo.png" className="w-6 h-6 mr-2" alt="Google Logo" />
            Sign up with Google
          </button>
          <Link href="http://localhost:4000/auth/redirect" type="submit" 
                className="flex-grow md:w-1/2 border border-gray-300 text-gray-900 py-2 px-4 rounded hover:bg-indigo-500 flex items-center">
            <img src="./images/42_Logo.png" className="w-6 h-6 mr-2" alt="42 Logo" 
            /> Sign up with Intra</Link>
        </div>

      </form>
    </div>
  );
}

export default Signup;






















