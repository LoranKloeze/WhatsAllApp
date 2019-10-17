const Api = {}

if (process.env.NODE_ENV === 'development') {
    window.WAA_Api = Api
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
        const regexApp = /\/app3\..+.js/
        let appScriptUrl

        // Derive script urls
        for (let i = 0; i < scripts.length; i++) {
            const src = scripts[i].src
            if (regexApp.exec(src) != null) {
                appScriptUrl = src
            }

        }

        // Download scripts, regex them and assign store
        fetch(appScriptUrl).then(e => {
            const reader = e.body.getReader()
            let js_src = ""

            return reader.read().then(function readMore({done, value}) {
                const td = new TextDecoder("utf-8")
                const str_value = td.decode(value)
                if (done) {
                    js_src += str_value

                    const WLAPWAPStore = window.webpackJsonp([], null, ["bihdhbjih"]).default
                    Api.WLAPWAPStore = WLAPWAPStore

                    const WLAPStore = window.webpackJsonp([], null, ["bhggeigghg"]).default
                    Api.WLAPStore = WLAPStore
                    resolve()

                    return
                }

                js_src += str_value
                return reader.read().then(readMore)

            })

        })

    })
}

export const getApi = () => {
    if (Api && typeof Api.WLAPStore === "object" && typeof Api.WLAPWAPStore === "object") {
        return Api
    } else {
        console.error('WWapApi is not initialized, call initApi() first')
    }


}