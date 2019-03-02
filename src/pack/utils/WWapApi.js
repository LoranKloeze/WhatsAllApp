const Api = {}

if (process.env.NODE_ENV === 'development') {
    window.WAA_Api = Api
}

function findWLAPWAPStore(js_src, url) {
    const regExDynNameStore = /Wap:[a-z]\('"(\w+)"'\)/
    const res = regExDynNameStore.exec(js_src)
    if(!res) {
        return
    }

    const funcName = res[1]
    console.log(`findWLAPWAPStore: ${funcName}`)
    window.webpackJsonp([], {[funcName]: (x, y, z) => {Api.WLAPWAPStore = z('"' + funcName + '"')}}, funcName)
}

function findWLAPStore(js_src, url) {
    const regExDynNameStore = /'"(\w+)"':function\(e,t,i\)\{\"use strict\";e\.exports=\{AllStarredMsgs:/
    const res = regExDynNameStore.exec(js_src)
    if(!res) {
        return
    }

    const funcName = res[1]
    console.log(`findWLAPStore: ${funcName}`)
    window.webpackJsonp([], {[funcName]: (x, y, z) => Api.WLAPStore = z('"' + funcName + '"')}, funcName)
}

export const initApi = () => {
    return new Promise((resolve, reject) => {
        /*
        *  There are 2 stores that need initializing: WLAPStore and WLAPWAPStore.
        *  From the WA DOM we extract 2 scrips, download and regex them to search
        *  for the correct function names in the webpacked WA javascripts.   *
        *
        * */

        const scripts = document.getElementsByTagName('script')
        const regexAppScript = /\/app\d?\..+.js/
        let appScriptUrls = [];

        // Derive script urls
        for (let i = 0; i < scripts.length; i++) {
            const src = scripts[i].src
            if (regexAppScript.exec(src) != null) {
                console.log("General: "+ src)
                appScriptUrls.push(src)
            }
        }

        let promises = Promise.all(appScriptUrls.map((url) => fetch(url)))
        promises.then((results) => {
            results.forEach((e) => {
                console.log(`Reading ${e.url}`);
                let reader = e.body.getReader();
                let js_src = "";
                reader.read().then(function readMore({done, value}) {
                    // join sources
                    const td = new TextDecoder("utf-8")
                    const str_value = td.decode(value)
                    if (done) {
                        js_src += str_value
                        if(!Api.WLAPWAPStore) {
                            findWLAPWAPStore(js_src, e.url)
                        }
                        if(!Api.WLAPStore) {
                            findWLAPStore(js_src, e.url)
                        }
                        return
                    }

                    js_src += str_value;
                    return reader.read().then(readMore)
                }).then(() => {
                    if (Api && typeof Api.WLAPStore === "object" && typeof Api.WLAPWAPStore === "object") {
                        resolve()
                    }
                })
            });
        }).catch((error) => {
            console.error(error);
        });
    })
}

export const getApi = () => {
    if (Api && typeof Api.WLAPStore === "object" && typeof Api.WLAPWAPStore === "object") {
        return Api
    } else {
        console.error('WWapApi is not initialized, call initApi() first')
    }
}
