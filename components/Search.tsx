'use client';

import React from 'react';

export default function Search() {
  const handleClick = () => {};
  return (
    <div className='flex flex-1 items-center justify-center p-6'>
      <div className='w-full max-w-lg'>
        <form className=' sm:flex sm:items-center'>
          <input
            id='q'
            name='search'
            className='inline w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-3 leading-5 text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm '
            placeholder='Coming Soon ......'
            type='search'
            required
          />
          {/* eslint-disable-next-line */}
          <button
            type='submit'
            onClick={handleClick}
            className='mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-search size-[18px] lg:size-5'
            >
              <circle cx='11' cy='11' r='8' />
              <path d='m21 21-4.3-4.3' />
            </svg>
          </button>
        </form>
      </div>
      <div className='hidden text-red-600 '>
        <p>Coming soon ......</p>
      </div>
    </div>
  );
}
