import { useEffect, useState } from 'react';
import DinoGame from './DinoGame'; // Make sure to create a separate file for DinoGame component
import { Neurosity } from '@neurosity/sdk'
import { Oval } from 'react-loader-spinner'; // Import the Oval spinner
import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { abi } from '../utils/abi.json';
import { createClient } from '@supabase/supabase-js';

function App() {
  const { primaryWallet } = useDynamicContext();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)
  const [account, setAccount] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [focus, setFocus] = useState(0);
  const [neurosity, setNeurosity] = useState<Neurosity | null>(null);
  const [subscription, setSubscription] = useState<{ unsubscribe: () => void } | null>(null);
  const [focusArray, setFocusArray] = useState<number[]>([]);
  const [showAvg, setShowAvg] = useState(false);
  const [avgFocus, setAvgFocus] = useState(0);
  const [aiImageUrl, setAiImageUrl] = useState("");
  const [prompt, setPrompt] = useState('');
  const [objectID, setObjectID] = useState("");
  const deviceId = import.meta.env.VITE_PUBLIC_NEUROSITY_DEVICE_ID;
  const email = import.meta.env.VITE_PUBLIC_NEUROSITY_EMAIL;
  const password = import.meta.env.VITE_PUBLIC_NEUROSITY_PASSWORD;
  const apiKey = import.meta.env.VITE_PUBLIC_API_KEY;

  const url = "https://api.getimg.ai/v1/flux-schnell/text-to-image";
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ response_format: 'b64', prompt: prompt })
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
      setShowAvg(true);
    }
    setIsMonitoring(false);
  };

  useEffect(() => {
    if (showAvg) {
      let sum = 0;
      for (let i = 0; i < focusArray.length; i++) {
        sum += focusArray[i];
      }
      const average = sum / focusArray.length;

      if (average >= 0 && average <= 0.2) {
        setPrompt('A baby dinosaur with a big brain in an egg shell, in the style of pixel art.');
      } else if (average > 0.2 && average <= 0.4) {
        setPrompt('A baby dinosaur with a big brain in the style of pixel art.');
      } else if (average > 0.4 && average <= 0.6) {
        setPrompt('A dinosaur with a big brain in the style of pixel art.');
      } else if (average > 0.6 && average <= 0.8) {
        setPrompt('A serious dinosaur with a big brain facing forward, in the style of pixel art.');
      } else if (average > 0.8 && average <= 1.0) {
        setPrompt('A fire-breathing dinosaur with a big brain in the style of pixel art.');
      }

      setAvgFocus(Math.round(average * 100));
    }
  }, [showAvg, focusArray]);

  useEffect(() => {
    if (prompt) {
      fetchData();
    }
  }, [prompt]);

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

  function base64ToBlob(base64String: string) {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' }); // Specify the image type here
  }

  function base64ToFile(base64String: string, fileName: string) {
    const blob = base64ToBlob(base64String);
    return new File([blob], fileName, { type: 'image/jpeg' });
  }

  useEffect(() => {
    const getAccount = async () => {
      if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
        setAccount(null);
        return;
      }
  
      try {
        const walletClient = await primaryWallet.getWalletClient();
        setAccount(walletClient.account.address);
      } catch (error) {
        console.error("Error getting account:", error);
        setAccount(null);
      }
    };
  
    getAccount();
  }, [primaryWallet]);
  
  const writeContractCall = async () => {
    const file = base64ToFile(aiImageUrl, 'neurosaur.png');
    const publisher = "https://walrus-testnet-publisher.nodes.guru";
    const url = `${publisher}/v1/store`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/png',
        },
        body: file,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded successfully:", data);
        console.log(data.newlyCreated.blobObject.blobId)
        setObjectID(data.newlyCreated.blobObject.blobId)
        // You might want to store or use the response data
      } else {
        console.error("File upload failed:", await response.text());
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }

    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return null;

    const publicClient = await primaryWallet.getPublicClient();
    const walletClient = await primaryWallet.getWalletClient();

    const account = walletClient.account.address;
    console.log(walletClient.account)
    const { request } = await publicClient.simulateContract({
      account,
      address: '0x080a2d469e74670f7d9336A0589AA75148CDa173',
      abi: abi,
      functionName: 'mintNFT',
      args: [objectID, avgFocus]
    })
    await walletClient.writeContract(request)
  }

  useEffect(() => {
    if (objectID && account) {
      const updateUserData = async () => {
        const { data, error } = await supabase
          .from('neurosaurs')
          .upsert(
            {
              wallet_address: account,
              object_id: objectID
            }
          )
        console.log(data)
        if (error) {
          console.error('Error updating user data:', error)
        } else {
          console.log('User data updated successfully')
        }
      }

      updateUserData()
    }
  }, [objectID, account])

  // Add this function to your component or in a separate utility file
  const retrieveImage = async (objectId: string) => {
    const aggregator = "https://walrus-testnet-aggregator.nodes.guru";
    const url = `${aggregator}/v1/${objectId}`;
    console.log(url)
    try {
      const response = await fetch(url);

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        console.log("Image retrieved successfully. URL:", imageUrl);
        return imageUrl;
      } else {
        console.error("Failed to retrieve image:", await response.text());
        return null;
      }
    } catch (error) {
      console.error("Error retrieving image:", error);
      return null;
    }
  };

  // You can then call this function like this:
  // useEffect(() => {
  //   const fetchImage = async () => {
  //     const objectId = "rxWzJTezrw_TB3RcxkWbLoyd9e8zcuM4LmtFG_bJOE4";
  //     const imageUrl = await retrieveImage(objectId);
  //     if (imageUrl) {
  //       // Do something with the imageUrl, e.g., set it in state
  //       setRetrievedImageUrl(imageUrl);
  //       console.log(imageUrl)
  //     }
  //   };

  //   fetchImage();
  // }, []); // Empty dependency array means this effect runs once on component mount

  // Add this to your component's state
  // const [retrievedImageUrl, setRetrievedImageUrl] = useState<string | null>(null);



  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', width: '100vw' }}>
      <div style={{ width: '100%', position: 'relative' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '5px' }}>Neurosaurs</h1>
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <DynamicWidget />
        </div>
      </div>
      <DinoGame />
      <p>{loggedIn ? "Neurosity Crown is connected! Your focus probability is:" : "Logging in to Crown..."}</p>
      <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '-0.5rem' }}>{focus}%</p>
      <div style={{ marginTop: '-1.5rem', display: 'flex', gap: '1rem' }}>
        <button onClick={startMonitoring} disabled={!loggedIn || isMonitoring}>Start</button>
        <button onClick={stopMonitoring} disabled={!isMonitoring}>Stop</button>
      </div>
      {/* {retrievedImageUrl && (
  <div>
    <h3>Retrieved Image:</h3>
    <img src={retrievedImageUrl} alt="Retrieved from Walrus" style={{ maxWidth: '200px' }} />
  </div>
)} */}
      {showAvg &&
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p>Your average focus probability is <span style={{ fontWeight: 'bold' }}>{avgFocus}%</span>!</p>
          <p style={{ marginTop: '-0.5rem' }}>Mint a Neurosaur that matches your focus:</p>
          {!aiImageUrl ?
            (<div>
              <Oval
                height={40}
                width={40}
                color="#000000" // make this black
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
                ariaLabel='oval-loading'
                secondaryColor="#000000"
                strokeWidth={2}
                strokeWidthSecondary={2}
              />
              <p>Generating...</p>
            </div>)
            : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img style={{ borderRadius: '1rem' }} width={200} src={`data:image/png;base64,${aiImageUrl}`} alt="AI Image" />
              <button style={{ marginTop: '0.5rem' }} onClick={writeContractCall}>Mint</button>
            </div>}
        </div>

      }
    </div>
  );
}

export default App;
