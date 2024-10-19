import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DynamicContextProvider, mergeNetworks } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors} from "@dynamic-labs/ethereum";
import App from './App.tsx'
import './index.css'

const evmNetworks = [
  {
    blockExplorerUrls: ['https://giant-half-dual-testnet.explorer.testnet.skalenodes.com'],
    chainId: 974399131,
    chainName: 'SKALE Testnet Calypso Hub',
    iconUrls: ['https://seeklogo.com/images/S/skale-skl-logo-62D9CA1BD7-seeklogo.com.png'],
    name: 'SKALE',
    nativeCurrency: {
      decimals: 18,
      name: 'sFUEL',
      symbol: 'sFUEL',
      iconUrl: 'https://skale.network/static/images/skale-icon.svg',
    },
    networkId: 344435,
    rpcUrls: ['https://testnet.skalenodes.com/v1/giant-half-dual-testnet'],
    vanityName: 'Calypso Testnet',
  }
];


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: "d27f3032-2d5f-4400-96c9-9c8dfdfc4a9e",
        walletConnectors: [EthereumWalletConnectors],
        overrides: { evmNetworks: (networks) => mergeNetworks(evmNetworks, networks) }
      }}
    >
      <App />
    </DynamicContextProvider>
  </StrictMode>,
)
