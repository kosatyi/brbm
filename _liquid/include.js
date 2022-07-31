export default {
    parse: function (tagToken, remainTokens) {
        this.name = tagToken.args
    },
    render: async function (ctx) {
        console.log(ctx)
    },
}
