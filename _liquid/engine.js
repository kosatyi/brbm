import { Liquid } from 'liquidjs'

export const engine = new Liquid({
    layouts: '_layouts',
    partials: '_includes',
    extname: '.liquid',
    dynamicPartials: false,
})
