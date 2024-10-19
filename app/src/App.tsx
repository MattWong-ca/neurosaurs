import { useEffect, useState, useCallback, useRef } from 'react'
import Webcam from 'react-webcam'
import './App.css'
import { Neurosity } from '@neurosity/sdk'

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [focus, setFocus] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [neurosity, setNeurosity] = useState<Neurosity | null>(null);
  const [subscription, setSubscription] = useState<{ unsubscribe: () => void } | null>(null);
  const [focusArray, setFocusArray] = useState<number[]>([]);
  const [focusState, setFocusState] = useState('');
  const [, setStoredAverage] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const [aiImageUrl, setAiImageUrl] = useState('');

  const deviceId = import.meta.env.VITE_PUBLIC_NEUROSITY_DEVICE_ID;
  const email = import.meta.env.VITE_PUBLIC_NEUROSITY_EMAIL;
  const password = import.meta.env.VITE_PUBLIC_NEUROSITY_PASSWORD;
  const apiKey = import.meta.env.VITE_PUBLIC_API_KEY;

  const url = 'https://api.getimg.ai/v1/stable-diffusion-xl/image-to-image';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      image: capturedImage,
      model: 'stable-diffusion-xl-v1-0',
      prompt: `A handsome young Anime character, ${focusState} at the screen.`,
      steps: 100,
      guidance: 20,
      response_format: 'b64',
      strength: 0.3
    })
  };

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
      setFocusState('dazing off');
    } else if (average > 0.2 && average <= 0.4) {
      setFocusState('with a questionining look');
    } else if (average > 0.4 && average <= 0.6) {
      setFocusState('looking');
    } else if (average > 0.6 && average <= 0.8) {
      setFocusState('staring intently');
    } else if (average > 0.8 && average <= 1.0) {
      setFocusState('staring intensely with red eyes');
    }
  }

  useEffect(() => {
    console.log('focusState: ', focusState);
  }, [focusState]);

  const takeSelfie = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc.slice(23));
      console.log(imageSrc)
      console.log(imageSrc.slice(23))
    }
  }, [webcamRef]);

  const fetchData = async () => {
    try {
      const response = await fetch(url, options);
      const json = await response.json();
      console.log("JSON: ", json)
      const aiImage = json.image
      console.log(aiImage)
      setAiImageUrl(aiImage);
    } catch (err) {
      console.log(err)
    }
  };

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
        {/* <div>
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
        </div> */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '400px', height: '400px', overflow: 'hidden' }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <button onClick={takeSelfie}>Take Selfie</button>
            <button onClick={fetchData}>Upload Selfie</button>
          </div>
        </div>
        {capturedImage && (
          <div>
            <img src={`data:image/jpeg;base64,${capturedImage}`} alt="Captured selfie" style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
          </div>
        )}
        <video ref={videoRef} style={{ display: 'none' }} />
        {aiImageUrl && (
          <div>
            <img src={`data:image/jpeg;base64,${aiImageUrl}`} alt="AI image" style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
          </div>
        )}
      </div>
    </>
  )
}

export default App
