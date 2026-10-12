import { data, type Data } from './data.ts'

export type Json = Data

export const json = (options: Json) => {
    return JSON.stringify(data(options), null, 2)
}
