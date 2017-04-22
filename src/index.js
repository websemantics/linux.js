var hashbang = "!#"
var xhr = new XMLHttpRequest()

get('/sys/fs.json', function (err, data) {
    if (err) {
        console.error('Failed to load ' + file)
        return;
    }
    render('tree', tree(data.fs))
})

/**
 * Parse files tree data and generate HTML    
 *  
 * @param {Object} files - files tree.
 * @returns {void}
 */
function tree(data) {
    var icons = window.FileIcons, icon

    /* Parse the files tree and generate html */
    function parse(files, nested, base) {

        base = base || ''
        var html = '', padding = nested * 16 + 6

        files.forEach(function (file) {
            var path = base + '/' + file.name
            var id = 'id' + path.replace(/[.\/]/g, '-')

            html += (file.child !== undefined) ?
                template('folder-template', {
                    id: id,
                    name: file.name,
                    content: parse(file.child, nested + 1, path),
                    padding: padding
                }) :
                template('file-template', {
                    id: id,
                    icon: (icon = icons.getClass(filename)) ? icon : 'text-icon',
                    name: file.name,
                    path: hashbang + '/' + path,
                    padding: padding
                })
        })

        return html;
    }
    return parse(data, /* initial padding */ 1)
}

/**
 * Insert html content into an element    
 *  
 * @param {string} id - element id 
 * @param {string} html - html content
 * @param {boolean} replace - replace the dom node
 */
function render(id, html, replace) {

    var elm = document.getElementById(id)

    if (replace) {
        var div = document.createElement('div')
        div.innerHTML = html
        elm.parentNode.replaceChild(div.firstElementChild, elm)
    } else {
        elm.innerHTML = html
        elm.scrollTop = 0
    }
}

/**
 * Get and compile a template, replace placeholder with their values
 * 
 * @param {string} id - template element id 
 * @param {object} context - key/value pairs, i.e. {name: 'World'}
 * @returns {string}
 */
function template(id, context) {

    var template = document.getElementById(id).innerText
    for (var name in context) {
        template = template.replace(new RegExp('{{' + name + '}}', 'gi'), context[name])
    }
    return template
}

/**
 * Make an HTTP GET request.
 * 
 * @param {string} url - resource url.
 * @param {Function} cb - Callback function.
 * @returns {void}
 */
function get(url, cb) {
    xhr.open('GET', url)
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = xhr.getResponseHeader('Content-Type') === 'application/json' ?
                    JSON.parse(xhr.responseText) : xhr.responseText
                cb(null, data)
            } else {
                cb(this, null)
            }
        }
    }
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
    xhr.send()
}