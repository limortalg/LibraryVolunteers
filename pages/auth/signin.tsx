import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SignIn() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    await signIn('google', {
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
        
        {/* Demo mode removed: Google only */}
      </div>
    </div>
  );
}

