export const bridgeAbi = [
  // Read functions
  "function owner() external view returns (address)",
  "function getSupportedToken(address token) external view returns (bool)",
  
  // Write functions
  "function deposit(address token, address recipient, uint256 amount) external",
  "function distribute(address token, address recipient, uint256 amount, uint256 nonce) external",
  "function emergencyWithdraw(address token, uint256 amount) external",
  
  // Events
  "event Deposit(address indexed token, address indexed from, address indexed to, uint256 amount, uint256 nonce)",
  "event Distribution(address indexed token, address indexed from, address indexed to, uint256 amount, uint256 nonce)",
  "event TokenAdded(address indexed token)",
  "event TokenRemoved(address indexed token)",
  "event EmergencyWithdraw(address indexed token, uint256 amount)"
];
