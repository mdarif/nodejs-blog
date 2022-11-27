import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const login = async () => {
    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
      navigate('/articles');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1>Log In</h1>
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
      <button onClick={login}>Log In</button>
      <Link to='/create-account'>Sign Up</Link>
    </>
  );
};

export default LoginPage;
