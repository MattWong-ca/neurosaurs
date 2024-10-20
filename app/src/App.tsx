import { useEffect, useState } from 'react';
import DinoGame from './DinoGame'; // Make sure to create a separate file for DinoGame component
import { Neurosity } from '@neurosity/sdk'

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [focus, setFocus] = useState(0);
  const [neurosity, setNeurosity] = useState<Neurosity | null>(null);
  const [subscription, setSubscription] = useState<{ unsubscribe: () => void } | null>(null);
  const [focusArray, setFocusArray] = useState<number[]>([]);

  const deviceId = import.meta.env.VITE_PUBLIC_NEUROSITY_DEVICE_ID;
  const email = import.meta.env.VITE_PUBLIC_NEUROSITY_EMAIL;
  const password = import.meta.env.VITE_PUBLIC_NEUROSITY_PASSWORD;

  useEffect(() => {
    const newNeurosity = new Neurosity({
      deviceId: deviceId,
    });
    setNeurosity(newNeurosity);

    const loginToDevice = async () => {
      try {
        await newNeurosity.login({
          email: email,
          password: password,
        });
        setLoggedIn(true);
        console.log("Logged in");
      } catch (error) {
        console.error("Login failed:", error);
      }
    };

    loginToDevice();
  }, []);

  const startMonitoring = () => {
    if (neurosity && loggedIn) {
      console.log("Starting monitoring");
      setIsMonitoring(true);
      const newSubscription = neurosity.focus().subscribe((focus) => {
        console.log(focus.probability);
        setFocusArray(prevArray => [...prevArray, focus.probability]);
        const focusValue = Math.round(focus.probability * 100);
        setFocus(focusValue);
      });
      setSubscription(newSubscription);
    }
  };

  const stopMonitoring = () => {
    if (subscription) {
      subscription.unsubscribe();
      setSubscription(null);
    }
    setIsMonitoring(false);
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', width: '100vw' }}>
      <h1>Neurosaur</h1>
      <DinoGame/>
      <p>{loggedIn ? "Neurosity Crown is connected! Your focus probability is:" : "Logging in to Crown..."}</p>
      <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '-0.5rem' }}>{focus}%</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={startMonitoring} disabled={!loggedIn || isMonitoring}>Start</button>
        <button onClick={stopMonitoring} disabled={!isMonitoring}>Stop</button> 
      </div>
    </div>
  );
}

export default App;
