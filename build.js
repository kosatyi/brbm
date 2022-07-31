const fs = require('fs')
const path = require('path')
const glob = require('glob-promise')
const yaml = require('yaml')
const parseMD = require('parse-md').default
const Liquid = require('liquidjs').Liquid
const marked = require('marked')

const engine = new Liquid({
    layouts: '_layouts',
    partials: '_includes',
    extname: '.liquid',
    dynamicPartials: false,
})

const fetchContent = (file) => {
    return fs.readFileSync(file).toString('utf-8')
}

const fetchData = async () => {
    const site = {}
    await glob('**/*.yml', {
        cwd: '_data',
    }).then((files) => {
        files.map((file) => {
            let ext = path.extname(file)
            let name = path.basename(file, ext)
            let contents = fetchContent(path.join('_data', file))
            site[name] = yaml.parse(contents)
        })
    })
    return site
}

const fileData = (file, cwd) => {
    let ext = path.extname(file)
    let name = path.basename(file, ext)
    let contents = fetchContent(cwd ? path.join(cwd, file) : file)
    let { metadata, content } = parseMD(contents)
    metadata.layout = metadata.layout || 'default'
    metadata.content = content
    metadata.filename = file
    metadata.name = name
    return metadata
}

const fetchCollection = async (name) => {
    const list = []
    await glob('**/*.{md,markdown}', {
        cwd: name,
    }).then((files) => {
        files.map((file) => {
            list.push(fileData(file, name))
        })
    })
    return list
}

const fetchPages = async () => {
    const list = []
    const ignore = ['.*/**/*.*', '_*/**/*.*', 'node_modules/**/*.*']
    await glob('**/*.liquid', {
        nodir: true,
        ignore: ignore,
    }).then((files) => {
        files.map((file) => {
            list.push(fileData(file))
        })
    })
    return list
}

const build = async () => {
    const site = {} // await fetchData()
    site.posts = await fetchCollection('_posts')
    site.pages = await fetchPages()
    return site
}

const changeExtension = (file, extension) => {
    const basename = path.basename(file, path.extname(file))
    return path.join(path.dirname(file), basename + extension)
}

const saveFile = (name, content) => {
    fs.mkdirSync(path.join('_site', path.dirname(name)), { recursive: true })
    fs.writeFileSync(path.join('_site', name), content)
}

build().then(function (site) {
    site.pages.forEach((page) => {
        const html = `{% layout ${page.layout} %}{% block %}${page.content}{% endblock %}`
        const template = engine.parse(html, page.filename)
        const content = engine.renderSync(template, {
            site,
            page,
        })
        const filename = changeExtension(page.filename, '.html')
        saveFile(filename, content)
    })
    site.posts.forEach((page) => {
        page.content = marked.parse(page.content)
        const html = `{% layout ${page.layout} %}{% block %}${page.content}{% endblock %}`
        const template = engine.parse(html, page.filename)
        const content = engine.renderSync(template, {
            site,
            page,
        })
        const filename = changeExtension(page.filename, '.html')
        saveFile(filename, content)
    })
})
