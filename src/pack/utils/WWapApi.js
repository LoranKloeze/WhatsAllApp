const Api = {};

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

        const scripts = document.getElementsByTagName('script');
        const regexApp = /\/app2\..+.js/;
        let appScriptUrl;

        // Derive script urls
        for (let i = 0; i < scripts.length; i++) {
            const src = scripts[i].src;
            if (regexApp.exec(src) != null) {
                appScriptUrl = src
            }

        }

        // Download scripts, regex them and assign store
        fetch(appScriptUrl).then(e => {
            const reader = e.body.getReader();
            let js_src = "";

            return reader.read().then(function readMore({done, value}) {
                const td = new TextDecoder("utf-8");
                const str_value = td.decode(value);
                if (done) {
                    js_src += str_value;

                    const regExDynNameStore1 = /Wap:\s*[a-z]\("(\w+)"\)/
                    const res1 = regExDynNameStore1.exec(js_src);
                    // const funcName1 = res1[1];
                    const funcName1 = "bihdhbjih";
                    //bihdhbjih

                    Api.WLAPWAPStore = window.webpackJsonp([], {
                        [funcName1]: (x, y, z) => {
                        }
                    }, [funcName1]);

                    const regExDynNameStore2 = /(\w+):\s*function\s*\(e,\s*t,\s*n\)\s*\{\s*\"use strict\";\s*e\.exports\s*=\s*\{\s*AllStarredMsgs\s*:/;
                    const res2 = regExDynNameStore2.exec(js_src);
                    // const funcName2 = res2[1];
                    const funcName2 = "djfhiceeje";
                    // djfhiceeje

                    const WLAPStore = window.webpackJsonp([], {
                        [funcName2]: (x, y, z) => {
                        }
                    }, [funcName2]);
                    resolve();

                    Api.WLAPStore = WLAPStore;

                    return
                }

                js_src += str_value;
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