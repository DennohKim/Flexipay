'use client'

import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import { useQuery } from '@apollo/client'
import { Button, Card, CardHeader, Stack, Typography } from '@mui/material'
import { Address, Freelancer, Organization } from '@/state/types'
// @mui
import IconButton from '@mui/material/IconButton'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
// components
import Iconify from '@/components/iconify'
import moment from 'moment'
import { useBoolean } from '@/hooks/use-boolean'
import AddFreelaDialog from './AddFreelancerDialog'
import { useEffect, useMemo } from 'react'
import { setOrganization } from '@/state/app'
import { selectOrganization } from '@/state/selectors'
import OrganizationTimeline from './OrganizationTimeLine'
import { FREELANCER_ADDS, GET_FREELANCERS, ORG_ADDED, ORG_FUNDED } from './graph-queries'
import EnsName from '@/components/ens-name'
import { formatEther } from 'viem'
import { paySalary } from '@/services/write-services'

// ----------------------------------------------------------------------
const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Name',
    width: 120,
    renderCell: (params) => <EnsName address={params.row.address} />,
  },
  {
    field: 'address',
    headerName: 'Address',
    width: 120,
  },
  {
    field: 'activity',
    headerName: 'Activity',
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'salary',
    headerName: 'Salary',
    type: 'number',
    width: 140,
    editable: true,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => ` ${formatEther(params.row.salary)}ETH`,
  },
  {
    field: 'verified',
    headerName: 'Verified',
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'daysWorked',
    headerName: 'Days Worked',
    flex: 1,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'pay-action',
    headerName: ' ',
    width: 60,
    align: 'center',
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params) => (
      <IconButton
        color="primary"
        onClick={async () => {
          try {
            const tx = await paySalary(params.row.address)
            toast.success(`🦄 salary payment transaction submitted! transaction: ${tx}`)
          } catch (error) {
            console.error(error)
            // toast.error(`Payment failed: ${error}`, {
            //   position: 'top-right',
            //   autoClose: 5000,
            //   hideProgressBar: false,
            //   closeOnClick: true,
            //   pauseOnHover: true,
            //   draggable: true,
            //   progress: undefined,
            //   theme: 'light',
            // })
          }
        }}
      >
        <Iconify icon="ic:outline-payment" />
      </IconButton>
    ),
  },
  {
    field: 'delete-action',
    headerName: ' ',
    width: 60,
    align: 'center',
    sortable: false,
    disableColumnMenu: true,
    renderCell: () => (
      <IconButton color="error">
        <Iconify icon="ic:outline-delete-forever" />
      </IconButton>
    ),
  },
]

type DataGridProps = {
  data: Freelancer[]
}

export function FreelancerDataGrid({ data }: DataGridProps) {
  return (
    <DataGrid
      columns={columns}
      rows={data}
      getRowId={(row) => row.address}
      // checkboxSelection
      disableRowSelectionOnClick
    />
  )
}

type Props = {
  address: Address
}

function OrganizationEvents({ address }: Props) {
  const dispatch = useAppDispatch()
  const org = useAppSelector(selectOrganization)

  const { data: freelancerAdded } = useQuery(FREELANCER_ADDS, {
    variables: {
      companyAddress: address,
    },
  })
  const { data: orgAdded } = useQuery(ORG_ADDED, { variables: { address } })
  const { data: orgFunded } = useQuery(ORG_FUNDED, { variables: { address } })

  const events = useMemo(() => {
    const results = []
    if (orgAdded && orgAdded.companyAddeds?.length) {
      results.push({
        id: orgAdded.companyAddeds[0].id,
        title: 'Organization Created',
        time: orgAdded.companyAddeds[0].blockTimestamp,
        type: 'order1',
      })
    }
    if (orgFunded) {
      for (const funded of orgFunded.companyFundeds) {
        results.push({
          id: funded.id,
          title: `Organization Funded ${formatEther(funded.amount)}ETH`,
          time: funded.blockTimestamp,
          type: 'order2',
        })
      }
    }
    if (freelancerAdded) {
      for (const Freelancer of freelancerAdded.FreelaAddeds) {
        results.push({
          id: Freelancer.id,
          title: 'Freela Added',
          time: Freelancer.blockTimestamp,
          type: 'order3',
        })
      }
    }

    return results.sort((a, b) => b.time - a.time)
  }, [freelancerAdded, orgAdded, orgFunded])
  return <OrganizationTimeline title="Events" subheader="the history" list={events} />
}

export default function OrganizationSection({ address }: Props) {
  const dispatch = useAppDispatch()
  const newFreelancerDialog = useBoolean()
  const org = useAppSelector(selectOrganization)

  const { data } = useQuery(GET_FREELANCERS, {
    variables: {
      companyAddress: address,
    },
  })

  useEffect(() => {
    if (org && data) {
      const freelancer = data.freelancer.map(
        (freelancer: {
          freelancerAddress: any
          companyAddress: any
          activity: any
          dailyWageWei: any
          verified: any
          daysWorked: any
        }) => ({
          address: freelancer.freelancerAddress,
          orgAddress: freelancer.companyAddress,
          activity: freelancer.activity,
          payout: Number(freelancer.dailyWageWei),
          verified: freelancer.verified,
          daysWorked: freelancer.daysWorked,
        }),
      )
      dispatch(setOrganization({ ...org, freelancer }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dispatch])

  if (!org) {
    return <Typography textAlign={'center'}>Loading...</Typography>
  }

  return (
    <>
      <Stack sx={{ width: '100%' }} spacing={2}>
        <Card>
          <CardHeader
            title="freelancer"
            sx={{ mb: 2 }}
            action={
              <Button
                variant="contained"
                size="large"
                sx={{ marginLeft: 'auto' }}
                onClick={newFreelancerDialog.onTrue}
              >
                New Freela
              </Button>
            }
          />

          <Box sx={{ height: 390 }}>
            <FreelancerDataGrid data={org.freelancer ?? []} />
          </Box>
        </Card>
        {org && <OrganizationEvents address={address} />}
      </Stack>
      <AddFreelaDialog organization={org} dialog={newFreelancerDialog} />
    </>
  )
}
