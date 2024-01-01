// Test cases
export const named = 'named';
export {named as nestedNamed, default as nestedDefault, nested} from './nested'
export * as all from './nested'
export default 'default'
export function func() {}

export * from './reexport'
