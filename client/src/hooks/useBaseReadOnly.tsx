import { useEffect, useState } from 'react';
import { createPublicClient, formatEther, http } from 'viem';
import { useAuthContext } from '@/providers/web3-provider';
import chowliveRoomABI from '@/utils/helpers/abis/ChowliveRoom.json';
import { baseSepolia } from 'viem/chains';


export const useBaseReadOnly = () => {
  const [fetching, setFetching] = useState(true);
  const { address } = useAuthContext();
  const [baseBalance, setBaseBalance] = useState<string | null>(null);

  useEffect(() => {
    const getBalance = async () => {
      if (!address) {
        return;
      }
      try {
        const client = createPublicClient({
          chain: baseSepolia,
          transport: http(),
        });
        const balance = await client.getBalance({ address: address as `0x${string}` });
        console.log('base balance', balance);
        const formatted = formatEther(balance);
        setBaseBalance(parseFloat(formatted).toFixed(3).toString());
        setFetching(false);
      } catch (e) {
        alert(e);
        setFetching(false);
      }
    };

    if (address && fetching) {
      getBalance();
    }
  }, [address, fetching, setBaseBalance]);

  const fetchMySubscriptions = async () => {
    if (!address) {
      return;
    }
    try {
      const client = createPublicClient({
        chain: baseSepolia,
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
        chain: baseSepolia,
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
    baseBalance,
    fetchMySubscriptions,
    fetchNFTDetails,
  };
};
