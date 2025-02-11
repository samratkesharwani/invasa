import React from 'react'
import { useNavigate } from 'react-router-dom';
const PrimaryOutlineButton = ({title, link}) => {
  const navigate = useNavigate();
const redirectTo = () => {
  navigate(`${link}`);
// window.location.href = `http://localhost:3000${link}`;
}

    return (
    <button onClick={redirectTo} className='border-primary border rounded-md inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-primary hover:bg-blue-light-5 hover:text-body-color dark:hover:text-dark-3 disabled:bg-gray-3 disabled:border-gray-3 disabled:text-dark-5 active:bg-blue-light-3'>
      {title}
    </button>
  )
}

export default PrimaryOutlineButton