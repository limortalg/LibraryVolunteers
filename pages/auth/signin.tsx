import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function SignIn() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleGoogleSignIn = async () => {
    await signIn('google', {
      callbackUrl: '/',
    });
  };

  const handleMockSignIn = async () => {
    await signIn('credentials', {
      email: email || 'demo@example.com',
      name: name || 'Demo User',
      callbackUrl: '/',
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          marginBottom: '20px', 
          fontSize: '2rem',
          textAlign: 'center',
          color: '#1976d2'
        }}>
          Library Shifts Manager
        </h1>
        <p style={{ 
          marginBottom: '30px', 
          textAlign: 'center',
          color: '#666'
        }}>
          Sign in to continue
        </p>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '14px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.2s',
            marginBottom: '15px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
        >
          Sign in with Google
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '20px 0'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
          <span style={{ margin: '0 15px', fontSize: '0.9rem', color: '#999' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }} />
        </div>
        
        <p style={{
          fontSize: '0.9rem',
          color: '#666',
          textAlign: 'center',
          marginBottom: '15px'
        }}>
          Demo Mode (No Setup Required)
        </p>

        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          />
        </div>

        <button
          onClick={handleMockSignIn}
          style={{
            width: '100%',
            backgroundColor: '#999',
            color: 'white',
            border: 'none',
            padding: '14px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#777'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#999'}
        >
          Sign In (Demo Mode)
        </button>
      </div>
    </div>
  );
}

