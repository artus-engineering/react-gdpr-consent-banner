const defaultLocale = 'de'

function normalizeBasePath(basePath: string): string {
    return basePath.replace(/\/$/, '')
}

export function getRootRedirectScript(basePath = process.env.NEXT_BASE_PATH || ''): string {
    const base = normalizeBasePath(basePath)

    return `(function(){try{var b=${JSON.stringify(base)};var p=location.pathname;var isRoot=!b?p==="/"||p==="":p===b||p===b+"/";if(!isRoot)return;var langs=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||${JSON.stringify(defaultLocale)}];var locale=${JSON.stringify(defaultLocale)};for(var i=0;i<langs.length;i++){var t=String(langs[i]).toLowerCase();if(t.indexOf("de")===0){locale="de";break}if(t.indexOf("en")===0){locale="en";break}}location.replace((b||"")+"/"+locale+"/")}catch(e){}})();`
}
