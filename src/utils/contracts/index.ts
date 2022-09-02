import { Contract, providers } from 'ethers';
import UiPoolDataProvider from './abis/UiPoolDataProvider.json';
import LendingPool from './abis/LendingPool.json';
import LendingPoolAddressesProvider from './abis/LendingPoolAddressesProvider.json';
import ERC20ABI from './abis/ERC20.json';
import Multicall from './abis/Multicall.json';
import MultiFeeDistribution from './abis/MultiFeeDistribution.json';
import ChefIncentivesController from './abis/ChefIncentivesController.json';
import MasterChef from './abis/MasterChef.json';
import SwappiPair from './abis/SwappiPair.json';
import GoledoToken from './abis/GoledoToken.json';
import WETHGateway from './abis/WETHGateway.json';
import DebtToken from './abis/DebtTokenBase.json';

export const HttpProvider = new providers.JsonRpcProvider(import.meta.env.VITE_ESpaceRpcUrl);

export const UiPoolDataContract = new Contract(import.meta.env.VITE_UiPoolDataProviderAddress, UiPoolDataProvider, HttpProvider);
export const LendingPoolContract = new Contract(import.meta.env.VITE_LendingPoolAddress, LendingPool, HttpProvider);
export const LendingPoolAddressesContract = new Contract(import.meta.env.VITE_LendingPoolAddressesProviderAddress, LendingPoolAddressesProvider, HttpProvider);
export const MulticallContract = new Contract(import.meta.env.VITE_MulticallContract, Multicall, HttpProvider);
export const MultiFeeDistributionContract = new Contract(import.meta.env.VITE_MultiFeeDistributionAddress, MultiFeeDistribution, HttpProvider);
export const ChefIncentivesControllerContract = new Contract(import.meta.env.VITE_ChefIncentivesControllerContractAddress, ChefIncentivesController, HttpProvider);
export const MasterChefContract = new Contract(import.meta.env.VITE_MasterChefAddress, MasterChef, HttpProvider);
export const SwappiPaiContract = new Contract(import.meta.env.VITE_SwappiPairAddress, SwappiPair, HttpProvider);
export const WETHGatewayContract = new Contract(import.meta.env.VITE_WETHGatewayAddress, WETHGateway, HttpProvider);

export const createERC20Contract = (tokenAddress: string) => new Contract(tokenAddress, ERC20ABI, HttpProvider);
export const createDebtTokenContract = (tokenAddress: string) => new Contract(tokenAddress, DebtToken, HttpProvider);
export const GoledoTokenContract = new Contract(import.meta.env.VITE_GoledoTokenAddress, GoledoToken, HttpProvider);
export const LpTokenContract = new Contract(import.meta.env.VITE_SwappiPairAddress, ERC20ABI, HttpProvider);