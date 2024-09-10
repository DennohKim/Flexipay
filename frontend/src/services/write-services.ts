import { baseSepolia } from 'viem/chains'
import payrollAbi from '@/config/payrollAbi'
import { writeContract } from '@wagmi/core'
import { config } from '@/config'
import { Address } from '@/state/types'
import { PAYROLL_CONTRACT_ADDRESS } from '@/config/constants'

export async function createOrg(name: string) {
  const result = await writeContract(config, {
    chainId: baseSepolia.id,
    abi: payrollAbi,
    functionName: 'addBusinessEntity',
    args: [name],
    address: PAYROLL_CONTRACT_ADDRESS,
  })
  console.log('add new org', result)
  return result
}

export async function addNewFreelancer(address: Address, salary: number, activity: string) {
  const result = await writeContract(config, {
    chainId: baseSepolia.id,
    abi: payrollAbi,
    functionName: 'addFreelancer',
    args: [address, BigInt(salary), activity],
    address: PAYROLL_CONTRACT_ADDRESS,
  })
  console.log('add new Freelancer transaction', result)
  return result
}


export async function paySalary(address: Address) {
  const result = await writeContract(config, {
    chainId: baseSepolia.id,
    abi: payrollAbi,
    functionName: 'payout',
    args: [address],
    address: PAYROLL_CONTRACT_ADDRESS,
  })
  console.log('payout to freelancer', result)
  return result
}
