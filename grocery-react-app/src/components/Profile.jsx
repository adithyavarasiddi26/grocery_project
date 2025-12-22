import React,{useState,useEffect} from 'react';
import './Profile.css';
import { useNavigate } from 'react-router-dom';




function Profile() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [enableEdit,setEnableEdit] = useState(true);
  const [backup,setBackup] = useState([]);
  const [change,setChange] = useState(false);

  const handleEditClick = () => {
    setEnableEdit(!enableEdit);
    if(!enableEdit){
      setUserDetails(backup);
      setChange(false);
    }
  }

  const handleSave = async () => {
    // Validation
    if (!userDetails?.name?.trim() || !userDetails?.email?.trim() || !userDetails?.phone?.trim() || !userDetails?.shop_name?.trim() || !userDetails?.address?.trim()) {
      alert('All fields are required.');
      return;
    }
    if (!/^\d{10}$/.test(userDetails.phone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    if (!/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,})$/.test(userDetails.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (window.confirm("Are you sure you want to save?")) {
      try {
        const response = await fetch('http://localhost:5000/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(userDetails)
        });
        if (response.ok) {
          const updatedUser = await response.json();
          setUserDetails(updatedUser);
          setBackup(updatedUser);
          setChange(false);
          setEnableEdit(true);
          alert('Profile updated successfully!');
        } else {
          console.error('Error updating profile:', response.statusText);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  useEffect(() => {
    console.log("backup",backup);
  }, [backup]);

  async function fetchUserDetails() {
      try {
        const response = await fetch('http://localhost:5000/profile'
        , {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if(data){
          setUserDetails(data);
          setBackup(data);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    
  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    console.log(userDetails);
  }, [userDetails]);

  return (
    <div className='container'>
      <div className='main-content'>
        <h2>Profile Settings</h2>
        <div className='nameHeader'>
        <div className='profile-avatar-icon' style={{width:'100px', height:'100px'}}>
          <svg width="60" height="60" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" fill="#fff"/>
        <rect x="4" y="16" width="16" height="6" rx="3" fill="#fff"/>
      </svg>
    </div>
  <h1 style={{margin:'0'}}>{userDetails?.name?.toUpperCase()}</h1>
    </div>
    <div className='button-group'>
      <button className='btn' onClick={handleEditClick}>{enableEdit ? 'Edit' : 'Cancel'}</button>
      <button disabled={!change} className='btn' onClick={handleSave}>Save</button>
    </div>
        <div className='info-section'>
          <div className='input-group'>
            <div className='text-label'>
              <label className='info-label'>Name</label>
              <input disabled={enableEdit} type="text" onChange={(e) => {setUserDetails({...userDetails, name: e.target.value}); setChange(true);}} value={userDetails?.name || ''} className='info-input' />
            </div>
            <div className='text-label'>
              <label className='info-label'>Email</label>
              <input disabled={enableEdit} type="email" onChange={(e) => {setUserDetails({...userDetails, email: e.target.value}); setChange(true);}} value={userDetails?.email || ''} className='info-input' />
            </div>


            <div className='text-label'>
              <label className='info-label'>Phone</label>
              <input disabled={enableEdit} type="text" onChange={(e) => {setUserDetails({...userDetails, phone: e.target.value}); setChange(true);}} value={userDetails?.phone || ''} className='info-input' />
            </div>
            <div className='text-label'>
              <label className='info-label'>Shop Name</label>
              <input disabled={enableEdit} type="text" onChange={(e) => {setUserDetails({...userDetails, shop_name: e.target.value}); setChange(true);}} value={userDetails?.shop_name || ''} className='info-input' />
            </div>


          <div className='text-label full-width'>
          <label className='info-label'>Shop Address</label>
          <textarea rows="3" disabled={enableEdit} onChange={(e) => {setUserDetails({...userDetails, address: e.target.value}); setChange(true);}} value={userDetails?.address || ''} className='info-input'></textarea>
          </div>
          </div>
        </div>
        <div className='resetButton'>
        <button className='btn'onClick={() => navigate('/profile/reset-password')}>Reset Password</button>
        </div>
    </div>
    </div>
  );
}

export default Profile;