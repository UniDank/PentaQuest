import type { Store } from 'pinia'
import cloneDeep from 'lodash.clonedeep'

export function resetStore({ store: storeToReset }: { store: Store }) {
  const initialState = cloneDeep(storeToReset.$state)
  storeToReset.$reset = () => storeToReset.$patch(cloneDeep(initialState))
}
