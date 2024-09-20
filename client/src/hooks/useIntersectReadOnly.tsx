import { useEffect, useState } from 'react';
import { createPublicClient, defineChain, formatEther, http, parseEther } from 'viem';
import { useAuthContext } from '@/lib/AuthProvider';
import chowliveRoomABI from '../util/abis/ChowliveRoom.json';

export const intersectTestnet = defineChain({
  id: 1612,
  name: 'Intersect Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Pearl',
    symbol: 'Pearl',
  },
  rpcUrls: {
    default: {
      http: ['https://subnets.avax.network/pearl/testnet/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://subnets-test.avax.network/intersect/',
    },
  },
});

export const useIntersectReadOnly = () => {
  const [fetching, setFetching] = useState(true);
  const { address } = useAuthContext();
  const [intersectBalance, setIntersectBalance] = useState<string | null>(null);

  useEffect(() => {
    const getBalance = async () => {
      if (!address) {
        return;
      }
      try {
        const client = createPublicClient({
          chain: intersectTestnet,
          transport: http(),
        });
        const balance = await client.getBalance({ address: address as `0x${string}` });
        console.log('intersect balance', balance);
        const formatted = formatEther(balance);
        setIntersectBalance(parseFloat(formatted).toFixed(3).toString());
        setFetching(false);
      } catch (e) {
        alert(e);
        setFetching(false);
      }
    };

    if (address && fetching) {
      getBalance();
    }
  }, [address, fetching, setIntersectBalance]);

  const fetchMySubscriptions = async () => {
    if (!address) {
      return;
    }
    try {
      const client = createPublicClient({
        chain: intersectTestnet,
        transport: http(),
      });

      const data: any = await client.readContract({
        address: process.env.NEXT_PUBLIC_CHOWLIVE_ROOM as `0x${string}`,
        abi: chowliveRoomABI.abi,
        functionName: 'getUserSubscribedRooms',
        args: [address],
      });

      return data ? data.map((x: any) => Number(x)) : undefined;
    } catch (e) {
      alert(e);
      setFetching(false);
    }
  };

  const fetchNFTDetails = async (roomId: number | BigInt) => {
    if (!address) {
      return;
    }
    try {
      const client = createPublicClient({
        chain: intersectTestnet,
        transport: http(),
      });

      const data: any = await client.readContract({
        address: process.env.NEXT_PUBLIC_CHOWLIVE_ROOM as `0x${string}`,
        abi: chowliveRoomABI.abi,
        functionName: 'getRoomDetails',
        args: [roomId],
      });

      return data;
    } catch (e) {
      console.log(e);
      setFetching(false);
    }
  };

  return {
    intersectBalance,
    fetchMySubscriptions,
    fetchNFTDetails,
  };
};
