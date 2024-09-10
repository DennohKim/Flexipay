import { gql } from '@apollo/client'

export const FREELANCER_ADDS = gql`
  query freelancerAdds($entityAddress: String!) {
    freelancerAddeds(where: { entityAddress: $entityAddress }) {
      id
      activity
      freelancerAddress
      entityAddress
      dailyWageWei
      blockTimestamp
    }
  }
`

export const GET_FREELANCERS = gql`
  query freelancers($entityAddress: String!) {
    freelancers(where: { entityAddress: $entityAddress }) {
      id
      activity
      freelancerAddress
      entityAddress
      dailyWageWei
      verified
      daysWorked
      blockTimestamp
    }
  }
`

export const ORG_ADDED = gql`
  query OrgAdded($address: Bytes!) {
    businessEntityAddeds(where: { entityAddress: $address }) {
      id
      entityName
      entityAddress
      blockTimestamp
    }
  }
`

export const ORG_FUNDED = gql`
  query OrgFunded($address: Bytes!) {
    businessEntityFundeds(where: { entityAddress: $address }) {
      id
      entityAddress
      amount
      blockTimestamp
    }
  }
`
