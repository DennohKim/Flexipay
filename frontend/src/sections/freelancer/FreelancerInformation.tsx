'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { Button, Paper } from '@mui/material'
import { fetchFreelancer } from '@/services/read-services'
import { Freelancer } from '@/state/types'
import { formatEther } from 'viem'
import Iconify from '@/components/iconify'
import { paySalary } from '@/services/write-services'
import { toast } from 'react-toastify'
import { useEnsAvatar, useEnsName } from 'wagmi'
import { config } from '@/config'
import { sepolia } from 'viem/chains'

type Props = {
  address: `0x${string}`
}

export default function FreelancerInformation({ address }: Props) {
  const [freelancerInfo, setFreelancerInfo] = useState<Freelancer | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const { data: ensName } = useEnsName({
    address,
    chainId: sepolia.id,
  })

  const { data: avatarUrl } = useEnsAvatar({
    name: ensName ?? undefined,
  })

  useEffect(() => {
    const loadFreelancerInfo = async () => {
      try {
        const Freelancer = await fetchFreelancer(address)
        setFreelancerInfo(Freelancer)
      } catch (error) {
        console.error("Error fetching Freelancer info:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFreelancerInfo()
  }, [address])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!freelancerInfo) {
    return <div>No Freelancer information found.</div>
  }

  return (
    <div>
      <div className="FreelancerContainer">
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            margin: 'auto',
            '& > :not(style)': {
              m: 1,
              width: 1000,
              height: 300,
            },
          }}
        >
          <Paper elevation={24}>
            <div className="paper">
              <div className="FreelancerUserSide">
                {/* <Paper elevation={24}>
                  <Box
                    component="img"
                    sx={{
                      height: 200,
                      width: 200,
                      boxShadow: 5,
                    }}
                    alt="Freelancer avatar"
                    src={avatarUrl || "/loading.webp"}
                  />
                </Paper> */}
                <p>User Address</p>
                <div>
                  <p className="ensName">{ensName || address.substring(0, 15) + '...'}</p>
                </div>
              </div>
              <div className="FreelancerDataSide">
                <div className="FreelancerData">
                  <div className="FreelancerDataLabels">
                    <ul className="FreelancerDataLabels">
                      <li>🗓️ Days worked:</li>
                      <li>💰 Day Wage:</li>
                      <li>⚙️ Activity:</li>
                    </ul>
                  </div>
                  <div className="FreelancerDataValues">
                    <ul className="FreelancerDataValues">
                      <li>{freelancerInfo.daysWorked}</li>
                      <li>{formatEther(BigInt(freelancerInfo.payout))} Ξ</li>
                      <li>{freelancerInfo.activity}</li>
                    </ul>
                  </div>
                </div>
                <div className="totalBalance">
                  <p className="balancep">
                    Balance: <span className="value">{formatEther(BigInt(freelancerInfo.daysWorked * freelancerInfo.payout))} Ξ</span>
                  </p>
                  <Button
                    style={{ minWidth: '200px', minHeight: '35px' }}
                    variant="contained"
                    color="success"
                    onClick={async () => {
                      try {
                        const tx = await paySalary(address)
                        toast.success(`🦄 salary payment transaction submitted! transaction: ${tx}`)
                      } catch (error) {
                        console.error(error)
                        toast.error(`Payment failed: ${error}`)
                      }
                    }}
                  >
                    <Iconify icon="tabler:world" />
                    Pay Now
                  </Button>
                </div>
              </div>
            </div>
          </Paper>
        </Box>
      </div>
    </div>
  )
}