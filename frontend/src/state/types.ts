import type { AppDispatch, RootState } from './store'

export type Role = 'freelancer' | 'Business Entity'

export type AppState = {
  role?: Role
  organization?: Organization
}

export enum FetchStatus {
  Idle,
  Loading,
  Success,
  Error,
}

export type ThunkConfig = {
  dispatch: AppDispatch
  state: RootState
  extra: any
}

export type Freelancer = {
  address: string
  orgAddress: string
  payout: number
  activity: string
  daysWorked: number
}

export type Organization = {
  orgAddress: `0x${string}`
  orgName: string
  orgTreasury: number
  freelancers?: Freelancer[]
}

export type Address = `0x${string}`
