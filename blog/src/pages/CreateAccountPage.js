import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CreateAccountPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const createAccount = async () => {
    try {
      // If the password and confirm password don't match, throw an error
      if (password !== confirmPassword) {
        setError('Password and confirm password do not match!');
        return; // return early
      }

      // If password and confirm password match, create account
      await createUserWithEmailAndPassword(getAuth(), email, password);
      navigate('/articles');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1>Create Account</h1>
      {error && <p className='error'>{error}</p>}
      <input
        placeholder='Your email address'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder='Your password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type='password'
      />
      <input
        placeholder='Re-enter your password'
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        type='password'
      />
      <button onClick={createAccount}>Create Account</button>{' '}
      <Link to='/login'>Already have an account? Log in here</Link>
    </>
  );
};

export default CreateAccountPage;
