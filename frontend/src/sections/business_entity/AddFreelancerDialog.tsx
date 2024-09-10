import { toast } from 'react-toastify'
import { getEnsAddress } from '@wagmi/core'
import { normalize } from 'viem/ens'
import { sepolia } from 'wagmi/chains'
// @mui
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
// hooks
import { ReturnType } from '@/hooks/use-boolean'
import { Address, Organization } from '@/state/types'
import { InputAdornment } from '@mui/material'
import { useRef, useState } from 'react'
import { addNewFreelancer } from '@/services/write-services'
import { config } from '@/config'

// ----------------------------------------------------------------------

type Props = {
  organization: Organization
  dialog: ReturnType
}

export default function AddFreelancerDialog({ organization, dialog }: Props) {
  const [freelancerAddress, setFreelancerAddress] = useState<string>('')
  const [addessOrEns, setAddessOrEns] = useState<string>('')
  const [salary, setSalary] = useState<number>()
  const [activity, setActivity] = useState<string>('')

  const [error, setError] = useState(false)
  const [helperText, setHelperText] = useState('')
  const requestIdRef = useRef(0)

  const onAddFreelancer = async () => {
    if (!freelancerAddress || !salary || !activity) return
    try {
      const tx = await addNewFreelancer(freelancerAddress as Address, salary * 1000000000000000000, activity)
      toast.success(`Add freelancer transaction submitted. transaction: ${tx}`)
    } catch (err) {
      toast.error(`Add freelancer: ${error}`)
    }
    dialog.onFalse()
  }

  const onFreelancerAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddessOrEns(value)
    if (value.startsWith('0x')) {
      setFreelancerAddress(e.target.value)
      setError(false)
      setHelperText('')
    } else {
      if (!value) return
      // Increment the requestId to indicate a new request
      requestIdRef.current += 1
      const currentRequestId = requestIdRef.current

      getEnsAddress(config, {
        chainId: sepolia.id,
        name: normalize(value),
      }).then((address) => {
        if (currentRequestId === requestIdRef.current) {
          if (!!address) {
            setFreelancerAddress(address)
            setError(false)
            setHelperText('')
          } else {
            setFreelancerAddress('')
            setError(true)
            setHelperText('Invalid ENS')
          }
        }
      })
    }
  }

  return (
    <div>
      <Dialog open={dialog.value} onClose={dialog.onFalse}>
        <DialogTitle>New freelancer</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 3 }}>
            After adding an freelancer, they must verify their personhood with World ID before receiving payments.
          </Typography>

          <TextField
            autoFocus
            fullWidth
            type="text"
            margin="dense"
            variant="outlined"
            error={error}
            helperText={helperText}
            label="Wallet Address or ENS"
            value={addessOrEns}
            onChange={onFreelancerAddressChange}
          />
          <TextField
            autoFocus
            fullWidth
            type="text"
            margin="dense"
            variant="outlined"
            label="payout"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
            }}
          />
          <TextField
            autoFocus
            fullWidth
            type="text"
            margin="dense"
            variant="outlined"
            label="Activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={dialog.onFalse} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={onAddFreelancer} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
