import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom'
function BackButton({styles}) {
    const navigate = useNavigate()
    const backButton =  ()=>{
        navigate(-1)
    }
  return (
    <div className={styles}>
      <ArrowBackIcon onClick={backButton}/>
    </div>
  )
}

export default BackButton
