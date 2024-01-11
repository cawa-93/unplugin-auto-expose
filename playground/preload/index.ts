// Test cases
export const named = 'named';
export const {property1, property2: destructedProperty, ...restDestructedObject} = {
    property1: 'property1',
    property2: 'property2',
    property3: 'property3',
    property4: 'property4'
};
export const [firstDestructedItem, ...restDestructedArray] = ['item1', 'item2', 'item2']

export {named as nestedNamed, default as nestedDefault, nested} from './nested'
export * as all from './nested'
export default 'default'

export function customFunction() {
}

export * from './reexport'

import {module as reexportedModule} from './reexport'

export {reexportedModule, named as named2, property1 as property12}
