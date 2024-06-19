import React from 'react';

export default function Search() {
  return (
    <div className='flex flex-1 items-center justify-center p-6'>
      <div className='w-full max-w-lg'>
        <form className=' sm:flex sm:items-center'>
          <input
            id='q'
            name='q'
            className='inline w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-3 leading-5 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm'
            placeholder='Find Your AI Tools'
            type='text'
          />
          <button
            type='submit'
            className='mt-3 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm'
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}