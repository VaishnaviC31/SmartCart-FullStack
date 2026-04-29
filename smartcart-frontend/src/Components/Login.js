import React from 'react';

function Login() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Login Page</h2>
      <form>
        <input type="text" placeholder="Username" /><br/><br/>
        <input type="password" placeholder="Password" /><br/><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;