import { useAccount, useReadContract, useBalance } from 'wagmi'
import { baseSepolia } from 'viem/chains'
import payrollAbi from '@/config/payrollAbi'
import { readContracts, readContract } from '@wagmi/core'
import { config } from '@/config'
import { Address, Freelancer, Organization } from '@/state/types'
import { PAYROLL_CONTRACT_ADDRESS } from '@/config/constants'

export async function fetchFreelancers(freelancerAddresses: readonly `0x${string}`[]) {
  const results = await readContracts(config, {
    contracts: freelancerAddresses.map((freelancerAddress) => ({
      chainId: baseSepolia.id,
      abi: payrollAbi,
      functionName: 'getFreelancer',
      args: [freelancerAddress],
      address: PAYROLL_CONTRACT_ADDRESS,
    })),
  })
  console.log('fetchFreelancers', results)

  return results
    .filter((result) => result.status === 'success')
    .map((result) => {
      const r = result.result as any

      return {
        address: r[0],
        orgAddress: r[1],
        payout: Number(r[4]),
        activity: r[5],
        daysWorked: Number(r[6]),
        latestPayReceived: Number(r[7]),
        openBalance: Number(r[8]),
      } as Freelancer
    })
}

export async function fetchFreelancer(address: `0x${string}`) {
  console.log('fetch', address)

  const result = await readContract(config, {
    chainId: baseSepolia.id,
    abi: payrollAbi,
    functionName: 'getFreelancer',
    args: [address],
    address: PAYROLL_CONTRACT_ADDRESS,
  })

  console.log('fetchFreelancer', result)
  return {
    address: result.freelancerAddress,
    orgAddress: result.companyAddress,
    payout: Number(result.dailyWageWei),
    activity: result.activity,
    daysWorked: Number(result.daysWorked),
  } as Freelancer
}

export async function fetchOrganization(address: Address) {
  const result = await readContract(config, {
    chainId: baseSepolia.id,
    abi: payrollAbi,
    functionName: 'getCompany',
    args: [address],
    address: PAYROLL_CONTRACT_ADDRESS,
  })

  return {
    orgAddress: result.companyAddress,
    orgName: result.companyName,
    orgTreasury: Number(result.treasury),
  } as Organization
}
