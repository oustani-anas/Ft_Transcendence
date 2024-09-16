import Link from "next/link";
import React from "react";

function SignPage() {
  return (
    <div className="grid place-items-center h-screen">
      <form className="w-full sm:w-96 md:w-120 lg:w-2/3 xl:w-[56%] p-8 border border-gray-300  rounded-lg bg-[#F4F4D4]">
        <div className="mb-6 text-center">
          <img src="./images/ping_pong.png" alt="logo" className="w-32 h-20 mx-auto mb-2" />
          <h2 className="text-gray-600 font-serif text-2xl">Hello, Welcome back</h2>
        </div>
        <div className="self-center col-span-2 relative bg-inherit border-[1px] border-[#c9c9c9] rounded-[10px] w-full mb-4">
          <input type="email" id="username" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500        focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
          <label htmlFor="" className="absolute text-sm text-[#c9c9c9] dark:text-[#c9c9c9] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#F4F4D4] px-2 peer-focus:px-2 peer-focus:text-        [#c9c9c9] peer-focus:dark:text-[#c9c9c9] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 peer-focus:-translate-y-4 start-1         rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Username or Email</label>
        </div>
        <div className="self-center col-span-2 relative bg-inherit border-[1px] border-[#c9c9c9] rounded-[10px] w-full mb-4">
          <input type="password" id="cPassword" className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500        focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
          <label htmlFor="cPassword" className="absolute text-sm text-[#c9c9c9] dark:text-[#c9c9c9] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#F4F4D4] px-2 peer-focus:px-2 peer-focus:text-        [#c9c9c9] peer-focus:dark:text-[#c9c9c9] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-[5px] peer-focus:scale-75 peer-focus:-translate-y-4 start-1         rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Password</label>
        </div>
        <div className="mb-4 flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="remember" className="pl-2 text-sm text-gray-600">
            Remember me
          </label>
          <p className="text-sm ml-auto text-gray-500 cursor-pointer">Forgot password?</p>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-500"
        >
          Login
        </button>
        <p className="text-gray-600 mt-4 text-center md:text-left">
          Dont have an account?{" "}
          <span className="text-blue-600 cursor-pointer">
            <Link href="./../Signup">Click Here</Link>
          </span>
        </p>

        <div className="my-4 text-center border-b border-gray-300 relative">
          <span className="bg-[#F4F4D4] px-4 text-gray-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            or
          </span>
        </div>

        {/* Center the "Sign in with Google" and "Sign up with Intra" buttons */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <button className="flex-grow md:w-1/2 bg-white border border-gray-300 text-gray-900 py-2 px-4 rounded hover:bg-indigo-500 flex items-center">
            <img src="./images/google_logo.png" className="w-6 h-6 mr-2" alt="Google Logo" />
            Sign in with Google
          </button>

          <button className="flex-grow md:w-1/2 bg-white border border-gray-300 text-gray-900 py-2 px-4 rounded hover:bg-indigo-500 flex items-center">
            <img src="./images/42_Logo.png" className="w-6 h-6 mr-2" alt="42 Logo" />
            Sign in with Intra
          </button>
        </div>

      </form>
    </div>
  );
}

export default SignPage;
