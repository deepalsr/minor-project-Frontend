
const connectButton = document.getElementById('connectButton');
const walletAddressDisplay = document.getElementById('walletAddress');
const errorMsg = document.getElementById('errorMsg');
const dnsActions = document.getElementById('dnsActions');
const actionStatus = document.getElementById('actionStatus');
const domainInput = document.getElementById('domainInput');

let provider;
let signer;
let contract;

const CONTRACT_ADDRESS = "0x41093398e61a8a52e4d127e1272d1aa0201cb3e1"; // use your deployed address here

const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_domain", "type": "string" },
      { "internalType": "string", "name": "_ip", "type": "string" }
    ],
    "name": "registerDomain",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_domain", "type": "string" }],
    "name": "resolveDomain",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_domain", "type": "string" },
      { "internalType": "string", "name": "_newIP", "type": "string" }
    ],
    "name": "updateIP",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_domain", "type": "string" },
      { "internalType": "address", "name": "_newOwner", "type": "address" }
    ],
    "name": "transferDomain",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_domain", "type": "string" }],
    "name": "getDomainInfo",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

connectButton.addEventListener('click', async () => {
  if (!window.ethereum) {
    errorMsg.textContent = '❌ MetaMask not found';
    return;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const address = await signer.getAddress();
    walletAddressDisplay.textContent = `✅ Wallet: ${address}`;
    dnsActions.style.display = 'block';
    errorMsg.textContent = '';
  } catch (error) {
    errorMsg.textContent = '❌ Failed to connect wallet';
    console.error(error);
  }
});

async function registerDomain() {
  const domain = domainInput.value.trim();
  const ip = prompt("Enter IP address to associate:");
  if (!domain || !ip) return;

  try {
    const tx = await contract.registerDomain(domain, ip);
    await tx.wait();
    actionStatus.textContent = `✅ Domain "${domain}" registered with IP "${ip}"`;
  } catch (err) {
    actionStatus.textContent = `❌ Registration failed: ${err?.data?.message || err.message}`;
  }
}

async function resolveDomain() {
  const domain = domainInput.value.trim();
  if (!domain) return;

  try {
    const ip = await contract.resolveDomain(domain);
    actionStatus.textContent = `🌐 Domain "${domain}" resolves to IP: ${ip}`;
  } catch (err) {
    actionStatus.textContent = `❌ Resolution failed: ${err?.data?.message || err.message}`;
  }
}

async function updateIP() {
  const domain = domainInput.value.trim();
  const newIP = prompt("Enter new IP address:");
  if (!domain || !newIP) return;

  try {
    const tx = await contract.updateIP(domain, newIP);
    await tx.wait();
    actionStatus.textContent = `✅ Domain "${domain}" updated to IP: ${newIP}`;
  } catch (err) {
    actionStatus.textContent = `❌ Update failed: ${err?.data?.message || err.message}`;
  }
}

async function transferDomain() {
  const domain = domainInput.value.trim();
  const newOwner = prompt("Enter new owner address:");
  if (!domain || !newOwner) return;

  try {
    const tx = await contract.transferDomain(domain, newOwner);
    await tx.wait();
    actionStatus.textContent = `🔁 Domain "${domain}" transferred to ${newOwner}`;
  } catch (err) {
    actionStatus.textContent = `❌ Transfer failed: ${err?.data?.message || err.message}`;
  }
}

async function getDomainInfo() {
  const domain = domainInput.value.trim();
  if (!domain) return;

  try {
    const [ip, owner] = await contract.getDomainInfo(domain);
    actionStatus.textContent = `ℹ️ Domain "${domain}" → IP: ${ip}, Owner: ${owner}`;
  } catch (err) {
    actionStatus.textContent = `❌ Info fetch failed: ${err?.data?.message || err.message}`;
  }
}
