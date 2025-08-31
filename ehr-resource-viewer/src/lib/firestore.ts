import { collection, query, onSnapshot, orderBy, QuerySnapshot, DocumentData } from 'firebase/firestore'
import { firestore } from './firebase'
import { ResourceWrapper } from './types'

export const RESOURCES_COLLECTION = 'resourceWrappers'

export const subscribeToResources = (
  callback: (resources: ResourceWrapper[]) => void,
  onError: (error: Error) => void
) => {
  const resourcesRef = collection(firestore, RESOURCES_COLLECTION)
  const q = query(resourcesRef, orderBy('resource.metadata.createdTime', 'desc'))

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const resources: ResourceWrapper[] = []
      snapshot.forEach((doc) => {
        const data = doc.data() as ResourceWrapper
        resources.push(data)
      })
      callback(resources)
    },
    onError
  )
}