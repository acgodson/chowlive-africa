import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User } from 'firebase/auth';
import { OpenloginUserInfo } from '@web3auth/openlogin-adapter';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AuthContextType = {
  isAuthenticated: boolean;
  isSessionLoading: boolean;
  loggedIn: boolean;
  web3User: Partial<OpenloginUserInfo> | null;
  user: User | null;
  signIn: () => void;
  signOut: () => void;
  getUserInfo: () => void;
  getAccounts: () => void;
  getBalance: () => void;
  signMessage: () => void;
  authenticateUser: () => void;
  sendTransaction: () => void;
  logout: () => void;
};

export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address) {
    return '';
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return 'Invalid Address';
  }
  if (address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}
