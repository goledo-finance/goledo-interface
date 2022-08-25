import { Contract, providers } from 'ethers';
import UiPoolDataProvider from './abis/UiPoolDataProvider.json';
import LendingPoolAddressesProvider from './abis/LendingPoolAddressesProvider.json';
import ERC20ABI from './abis/ERC20.json';
import Multicall from './abis/Multicall.json';
import MultiFeeDistribution from './abis/MultiFeeDistribution.json';
import ChefIncentivesController from './abis/ChefIncentivesController.json';
import MasterChef from './abis/MasterChef.json';
import SwappiPair from './abis/SwappiPair.json';
import GoledoToken from './abis/GoledoToken.json';

const HttpProvider = new providers.JsonRpcProvider(import.meta.env.VITE_ESpaceRpcUrl);

export const UiPoolDataContract = new Contract(import.meta.env.VITE_UiPoolDataProviderAddress, UiPoolDataProvider.abi, HttpProvider);
export const LendingPoolAddressesContract = new Contract(import.meta.env.VITE_LendingPoolAddressesProviderAddress, LendingPoolAddressesProvider.abi, HttpProvider);
export const MulticallContract = new Contract(import.meta.env.VITE_MulticallContract, Multicall.abi, HttpProvider);
export const MultiFeeDistributionContract = new Contract(import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistribution.abi, HttpProvider);
export const ChefIncentivesControllerContract = new Contract(import.meta.env.VITE_ChefIncentivesControllerContractAddress, ChefIncentivesController.abi, HttpProvider);
export const MasterChefContract = new Contract(import.meta.env.VITE_MasterChefAddress, MasterChef.abi, HttpProvider);
export const SwappiPaiContract = new Contract(import.meta.env.VITE_SwappiPairAddress, SwappiPair.abi, HttpProvider);

export const createERC20Contract = (tokenAddress: string) => new Contract(tokenAddress, ERC20ABI, HttpProvider);
export const GoledoTokenContract = new Contract(import.meta.env.VITE_GoledoTokenAddress, GoledoToken.abi, HttpProvider);