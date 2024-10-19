import { useEffect, useState } from 'react'
import './App.css'
import { Neurosity } from '@neurosity/sdk'

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [focus, setFocus] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [neurosity, setNeurosity] = useState<Neurosity | null>(null);
  const [subscription, setSubscription] = useState<{ unsubscribe: () => void } | null>(null);
  const [focusArray, setFocusArray] = useState<number[]>([]);
  const [color, setColor] = useState('');
  const [skinColor, setSkinColor] = useState('');
  const [storedAverage, setStoredAverage] = useState(0);

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
        const focusValue = Number(focus.probability.toFixed(2)) * 100;
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

  // const resetMonitoring = () => {
  //   stopMonitoring();
  //   setFocus(0);
  //   setFocusArray([]);
  // };

  const generateImage = () => {
    let sum = 0;
    for (let i = 0; i < focusArray.length; i++) {
      sum += focusArray[i];
    }
    const average = sum / focusArray.length;
    setStoredAverage(average);
    console.log('Average: ', average);

    if (average >= 0 && average <= 0.2) {
      setColor('yellow'); // Yellow (Unfocused)
    } else if (average > 0.2 && average <= 0.4) {
      setColor('light orange'); // Light Orange (Lightly Focused)
    } else if (average > 0.4 && average <= 0.6) {
      setColor('orange'); // Orange (Moderately Focus)
    } else if (average > 0.6 && average <= 0.8) {
      setColor('light red'); // Light Red (Mostly Focus)
    } else if (average > 0.8 && average <= 1.0) {
      setColor('red'); // Red (Very Focus)
    }
  }

  useEffect(() => {
    console.log('Color: ', color);
  }, [color]);

  return (
    <>
      <div>
        <h1>Neuromint</h1>
        <p>{loggedIn ? "Device is connected. Use buttons to control monitoring." : "Logging in to device..."}</p>
        <p>Focus: {focus}%</p>
        <button onClick={startMonitoring} disabled={!loggedIn || isMonitoring}>Start</button>
        <button onClick={stopMonitoring} disabled={!isMonitoring}>Stop</button>
        {/* <button onClick={resetMonitoring}>Reset</button> */}
        <button onClick={() => generateImage()}>print array</button>
        <div>
          <select
            value={skinColor}
            onChange={(e) => setSkinColor(e.target.value)}
            style={{ marginRight: '10px' }}
          >
            <option value="" disabled>Select skin color</option>
            <option value="pale white">Pale White</option>
            <option value="beige">Beige</option>
            <option value="light brown">Light Brown</option>
            <option value="brown">Brown</option>
            <option value="dark brown">Dark Brown</option>
          </select>
          <button onClick={generateImage}>
            Generate Image
          </button>
        </div>
      </div>
    </>
  )
}

export default App