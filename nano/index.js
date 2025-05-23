import { DateTime } from "luxon";
// crea un enum da usare come costanti con due funzioni che ritornano le chiavi e i valori dell'enum
function createEnum(...args) {
    const obj = {};
    for (let i = 0; i < args.length; i++) {
        obj[args[i]] = i;
    }
    // aggiungi a obj una funzione che ritorna le chiavi dell'enum come array di stringhe
    obj.keys = () =>
        Object.keys(obj).filter((key) => typeof obj[key] != "function");
    // aggiungi a obj una funzione che ritorna i valori dell'enum come array di numeri
    obj.intValues = () =>
        Object.values(obj).filter((value) => typeof value === "number");

    //  aggiungi una funzione che restiuisce i valori delle keys ma trimmate, lowercase e con gli spazi rimpiazzati da _
    obj.values = () =>
        Object.keys(obj)
            .filter((key) => typeof obj[key] != "function")
            .map((key) => key.trim().toLowerCase().replace(/\s+/g, "_"));

    //  Aggiungi un getter per accedere all'oggetto tramite la chiave, o con il value trimmate, lowercase e con gli spazi rimpiazzati da _
    obj.get = (key) => {
        return obj.values().includes(key)
            ? obj[key]
            : obj
                  .values()
                  .find(
                      (value) =>
                          value ===
                          key.trim().toLowerCase().replace(/\s+/g, "_")
                  );
    };

    //  crea una funzione format che accetta come parametro una callback che serve a formattare i valori di enum se necessario
    obj.format = (callback) => {};

    obj.toString = () => {
        if (obj.format && typeof obj.format === "function" && obj.format()) {
            return obj.format(obj);
        } else {
            // esegui il toString originale
            return Object.prototype.toString.call(obj);
        }
    };

    obj.toArray = () => {
        return Object.keys(obj)
            .filter((key) => typeof obj[key] != "function")
            .map((key) => {
                return {
                    id: obj[key],
                    key: key,
                    value: obj.values()[obj[key]],
                    name: key,
                };
            });
    };

    return obj;
}
//  un esempio di uso di createEnum
//  const colors = createEnum('red', 'green', 'blue');
//  console.log(colors.keys()); // Output: ['red', 'green', 'blue']
//  console.log(colors.values()); // Output: [0, 1, 2]

const hooks = {};
function Hook(debug = false) {
    // let hooks = hookrepo ?? {};

    function register(name, callback) {
        if ("undefined" == typeof hooks[name]) hooks[name] = [];
        hooks[name].push(callback);
    }

    function call(name, args) {
        if ("undefined" != typeof hooks[name])
            for (let i = 0; i < hooks[name].length; ++i)
                if (true !== hooks[name][i](args)) {
                    break;
                }
    }

    function unregister(name) {
        if (name.includes(".")) {
            let namespace = name.split(".")[1];
            for (let hookName in hooks) {
                if (hookName.endsWith("." + namespace)) {
                    delete hooks[hookName];
                    console.log(
                        'Tutti i callback per il hook "' +
                            hookName +
                            '" sono stati rimossi.'
                    );
                }
            }
            console.log(
                'Nessun hook trovato con il namespace "' + namespace + '".'
            );
        } else {
            if ("undefined" != typeof hooks[name]) {
                delete hooks[name];
                console.log(
                    'Tutti i callback per il hook "' +
                        name +
                        '" sono stati rimossi.'
                );
            } else {
                console.log('Nessun hook trovato per il nome "' + name + '".');
            }
        }
    }

    return {
        register: register,
        call: call,
        unregister: unregister,
    };
}

let hashId = 0;
// let sharedData = new Map();
const Tools = {
    // [need to import useWindowSize from '@vueuse/core']
    getWindowSize(filter = false) {
        if (Sys.VueApp())
            switch (filter) {
                case "width":
                    return Sys.VueApp().useWindowSize().width;
                case "height":
                    return Sys.VueApp().useWindowSize().height;
                default:
                    return Sys.VueApp().useWindowSize();
            }
    },
    getBreakpointSize(width = null) {
        if (!width && Tools.getWindowSize)
            width = Tools.getWindowSize("width").value;
        if (!width)
            throw new Error("Nessun valore di larghezza (width) trovato. ");
        const breakpoints = Sys.theme.breakpoints;
        let label = "8k"; // Default a 8k se non viene trovato un altro valore
        // Itera sui breakpoint per trovare l'etichetta corrispondente
        for (const [key, minWidth] of Object.entries(breakpoints)) {
            // console.log(key, minWidth, width);
            if (width >= minWidth) {
                label = key;
            }
        }
        return label;
    },
    isBreakpointSize(label, width = null) {
        if (!width && Tools.getWindowSize) width = Tools.getWindowSize("width");
        if (!width)
            throw new Error("Nessun valore di larghezza (width) trovato. ");
        return label === Tools.getBreakpointSize(width);
    },
    isNumber(value) {
        return typeof value === "number";
    },
    isNumerical(value, method = "all") {
        // Se il valore è già un numero, restituisce true
        if (typeof value === "number") {
            return true;
        }
        // Lista dei simboli di valuta (parziale) e unità di misura comuni
        const currencySymbols = "€$¥£₹₩₽¢₫₴₲₪₡₣₤₳";
        const unitSymbols = "kmgtpmunsmghzlbkgml";
        let numericalRegex;

        // Espressione regolare per validare una stringa numerica con valuta o unità di misura
        switch (method.toLowerCase()) {
            case "currency":
                numericalRegex = new RegExp(
                    `^[${currencySymbols}]?\\s*[+-]?\\d+([.,]?\\d+)*(\\s*[${currencySymbols}])?$`
                );
                break;
            case "unit":
                numericalRegex = new RegExp(
                    `^[${unitSymbols}]?\\s*[+-]?\\d+([.,]?\\d+)*(\\s*[${unitSymbols}])?$`
                );
                break;
            case "all":
            default:
                numericalRegex = new RegExp(
                    `^[${currencySymbols}${unitSymbols}]?\\s*[+-]?\\d+([.,]?\\d+)*(\\s*[${currencySymbols}${unitSymbols}])?$`
                );
        }

        // Verifica che il valore soddisfi l'espressione regolare
        return typeof value === "string" && numericalRegex.test(value.trim());
    },
    isString(value) {
        return typeof value === "string";
    },
    isBoolean(value) {
        return typeof value === "boolean";
    },
    isObject(value) {
        return value && typeof value === "object";
    },
    isFunction(value) {
        return typeof value === "function";
    },
    isUndefined(value) {
        return typeof value === "undefined";
    },
    isDate(value, format = null) {
        //need to import Luxon  Datetime from 'luxon'
        let date = new Date(value);
        if (format) {
            try {
                data = DateTime.fromFormat(value, format).local().toJSDate();
            } catch (error) {
                return false;
            }
        }
        if (Tools.isNaN(date.getTime())) return false;
        return date instanceof Date;
    },
    isPromise(value) {
        return value instanceof Promise;
    },
    isMap(value) {
        return value instanceof Map;
    },
    isSet(value) {
        return value instanceof Set;
    },
    isRegExp(value) {
        return value instanceof RegExp;
    },
    isError(value) {
        return value instanceof Error;
    },
    isElement(value) {
        return value instanceof Element;
    },
    isNull(value) {
        return value === null;
    },
    isNaN(value) {
        return Tools.isNaN(value);
    },
    isPhoneNumber(value) {
        // Definisce un'espressione regolare per un numero di telefono che può includere spazi, un prefisso opzionale con '+', e numeri.
        const phoneRegex = /^\+?\d[\d\s]*$/;
        // Verifica che il valore soddisfi l'espressione regolare e non sia vuoto.
        return phoneRegex.test(value.trim());
    },
    isFiscalCode(value) {
        // Espressione regolare per il codice fiscale italiano
        const fiscalCodeRegex =
            /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
        // Verifica che il valore soddisfi l'espressione regolare
        return fiscalCodeRegex.test(value.trim());
    },
    isBusinessCode(value) {
        // Espressione regolare per la Partita IVA italiana
        const businessCodeRegex = /^[0-9]{11}$/;
        // Verifica che il valore soddisfi l'espressione regolare
        return businessCodeRegex.test(value.trim());
    },
    isEmail(value) {
        // Espressione regolare per validare un indirizzo email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) return false;
        // Verifica che il valore soddisfi l'espressione regolare
        return emailRegex.test(value.trim());
    },
    isUrl(value) {
        // Espressione regolare per validare un URL
        const urlRegex = /^(https?:\/\/)?([^\s$.?#].[^\s]*)$/i;
        // Verifica che il valore soddisfi l'espressione regolare
        return urlRegex.test(value.trim());
    },
    isEmpty(value) {
        return value === "" || value === null || value === undefined;
    },
    // [need to import app and define app.config.globalProperties.window]
    isHomeLocation(url = false) {
        let path = `${Sys.Window().location.origin}`;
        let currentUrl = url;

        if (!url) currentUrl = Sys.Window().location.href;
        currentUrl = currentUrl.replace(path, "");

        if (currentUrl[currentUrl.length - 1] != "/") currentUrl += "/";

        // Divide l'URL corrente in parti utilizzando "/"
        let urlParts = currentUrl.split("/");

        // Dopo il dominio e la porta, controlla se ci sono altre parti nell'URL
        // Se ci sono parti aggiuntive, significa che ci sono sottopagine
        if (urlParts.length > 3) {
            // 3 perché "http:", "", "miodominio.it:2233" sono i primi tre elementi
            return false; // Ci sono sottopagine
        } else {
            return true; // Non ci sono sottopagine
        }
    },
    delay(milliseconds, data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(data);
            }, milliseconds);
        });
    },
    condizionalDelay: async (
        timeLimit,
        restartConditionCallback = null,
        stopConditionCallback = null,
        cycleCallback = null,
        data = undefined,
        resolveOnStop = false,
        interval = 100,
        namespace = "condizionalDelay-" + hashId
    ) => {
        // Controllo se le callback esistono e sono funzioni
        if (
            restartConditionCallback &&
            typeof restartConditionCallback !== "function"
        ) {
            throw new Error("The restart condition must be a function.");
        }
        if (
            stopConditionCallback &&
            typeof stopConditionCallback !== "function"
        ) {
            throw new Error("The stop condition must be a function.");
        }
        if (
            cycleCallback &&
            cycleCallback !== null &&
            typeof cycleCallback !== "function"
        ) {
            throw new Error("The cycle callback must be a function or null.");
        }
        // Controllo se l'intervallo è un numero positivo
        if (typeof interval !== "number" || interval <= 0) {
            throw new Error("The interval must be a positive number.");
        }
        // Controllo se il timeLimit è un numero positivo
        if (typeof timeLimit !== "number" || timeLimit <= 0) {
            throw new Error("The time limit must be a positive number.");
        }
        // console.log(`Condizional Delay: ${namespace} - timeLimit: ${timeLimit} - interval: ${interval} - data: ${data}`);

        return new Promise((resolve, reject) => {
            let elapsed = 0;

            const prima =
                data === undefined
                    ? true
                    : (() => {
                          return data;
                      })();
            let dopo = prima;

            const checkConditions = async () => {
                // Esegui la callback del ciclo se esiste
                if (cycleCallback) {
                    // se la funzione ha un valore di ritorno diverso da data
                    let stepResult = undefined;
                    if (Tools.isPromise(cycleCallback))
                        stepResult = await cycleCallback(
                            elapsed,
                            elapsed * interval,
                            interval,
                            prima
                        );
                    else
                        stepResult = cycleCallback(
                            elapsed,
                            elapsed * interval,
                            interval,
                            prima
                        );
                    dopo = stepResult === undefined ? prima : stepResult;
                    if (stepResult === false) {
                        reject({
                            elapsed,
                            milliseconds: elapsed * interval,
                            data: { start: prima, end: dopo },
                        });
                        return;
                    } // console.log('prima',prima,'dopo', dopo);
                }

                // Verifica la condizione di riavvio
                if (
                    restartConditionCallback &&
                    restartConditionCallback(
                        prima,
                        dopo,
                        prima !== dopo,
                        elapsed,
                        elapsed * interval,
                        interval
                    )
                ) {
                    elapsed = 0; // Riavvia il conteggio
                }

                // Verifica la condizione di stop
                if (
                    stopConditionCallback &&
                    stopConditionCallback(
                        prima,
                        dopo,
                        prima !== dopo,
                        elapsed,
                        elapsed * interval,
                        interval
                    )
                ) {
                    // console.log('Condizione di stop superata');
                    if (resolveOnStop)
                        resolve({
                            elapsed,
                            milliseconds: elapsed * interval,
                            data: { start: prima, end: dopo },
                        });
                    else
                        reject({
                            elapsed,
                            milliseconds: elapsed * interval,
                            data: { start: prima, end: dopo },
                        });
                    return;
                }

                // Incrementa il tempo trascorso
                elapsed++;

                // Se il tempo limite è raggiunto, risolvi la promessa
                if (elapsed * interval >= timeLimit) {
                    resolve({
                        elapsed,
                        milliseconds: elapsed * interval,
                        data: { start: prima, end: dopo },
                    });
                } else {
                    // Altrimenti, continua il ciclo
                    setTimeout(checkConditions, interval);
                }
            };

            // Inizia il ciclo di verifica
            checkConditions();
        });
    },
    toggleImpulse(valueA, valueb, delay) {
        const self = this;
        const obj = function () {
            value = [valueA, valueb];
            cursor = 0;
            getCurrent = () => {
                return value[cursor % 2];
            };
            toString = () => {
                return getCurrent();
            };
            change = (newValue = null) => {
                if (newValue) {
                    value[cursor + (1 % 2)] = newValue;
                }
                new Promise((resolve) => {
                    Tools.delay(delay).then(() => {
                        cursor++;
                        resolve(this.getCurrent());
                    });
                });
            };
        };
    },
    waitUntil(
        conditionCallback,
        cycleCallback,
        interval = 100,
        maxCycles = 100000
    ) {
        // Controllo se la conditionCallback esiste ed è una funzione
        if (
            typeof conditionCallback !== "function" &&
            conditionCallback !== null
        ) {
            throw new Error("First parameter must be a function");
        }
        // Controllo se la cycleCallback esiste ed è una funzione o null
        if (cycleCallback !== null && typeof cycleCallback !== "function") {
            throw new Error("The second parameter must be a function or null");
        }
        // Controllo se l'intervallo è un numero positivo
        if (typeof interval !== "number" || interval <= 0) {
            throw new Error("The third parameter must be a positive number.");
        }

        return new Promise((resolve, reject) => {
            let counter = 0;
            let maxLimit = maxCycles ?? 100000;
            const checkCondition = () => {
                // Esegui la callback del ciclo se esiste
                if (cycleCallback) {
                    cycleCallback(counter, counter * interval, interval);
                }
                // Verifica la condizione
                if (conditionCallback()) {
                    resolve({ counter, milliseconds: counter * interval });
                } else if (counter * interval >= maxLimit) {
                    reject({ counter, milliseconds: counter * interval });
                } else {
                    counter++;
                    setTimeout(checkCondition, interval);
                }
            };

            // Inizia il ciclo di verifica
            checkCondition();
        });
    },
    GetNewId(str = "uid") {
        hashId++;
        return str + hashId;
    },
    GenerateUniqueString(prefix = null, divider = "-") {
        const timestamp = Date.now();
        const formattedTimestamp = timestamp.toString(36); // Converte il timestamp in base 36
        const randomSuffix = Math.random().toString(36).substring(2, 8); // Genera un suffisso casuale in base 36
        if (!prefix) return formattedTimestamp + randomSuffix;
        return prefix + divider + formattedTimestamp + randomSuffix;
    },
    GetNewIndex() {
        hashId++;
        return hashId;
    },
    GetTime() {
        let time = new Date();
        return time.getTime();
    },
    GetNestedPropertyValue(obj, propertyPath) {
        const pathArray = propertyPath.split(".");
        let value = obj;

        if (isProxy && isProxy(value)) {
            // Se l'oggetto è un Proxy creato da Vue.js, utilizza il metodo getRawValue() per accedere al valore effettivo
            value = toRaw ? toRaw(value) : {};
        }

        for (const property of pathArray) {
            if (!value || typeof value !== "object") {
                return undefined; // Restituisci undefined se il percorso non è valido
            }
            value = value[property];
        }

        return value;
    },
    isProxy(obj) {
        //let res=obj !== null && typeof obj === 'object' && Object.getPrototypeOf(obj) === Proxy.prototype;

        return isProxy ? isProxy(obj) : obj;
    },
    getRaw(obj) {
        let result = obj;
        //let res=obj !== null && typeof obj === 'object' && Object.getPrototypeOf(obj) === Proxy.prototype;
        if (isProxy && isProxy(obj)) {
            // Se l'oggetto è un Proxy creato da Vue.js, utilizza il metodo getRawValue() per accedere al valore effettivo
            result = toRaw ? toRaw(obj) : obj;
        }
        return result;
    },
    trimJson(obj) {
        //let obj={...objSource};
        for (const key in obj) {
            // eslint-disable-next-line
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (Array.isArray(value) && value.length === 0) {
                    delete obj[key];
                } else if (typeof value === "object") {
                    // eslint-disable-next-line
                    Tools.trimJson(value); // Richiama la funzione ricorsivamente per oggetti annidati
                }
            }
        }
        //return obj;
    },
    async getImageSize(file) {
        let _URL = window.URL || window.webkitURL;
        return new Promise((res, err) => {
            let img;
            if (file) {
                img = new Image();
                let objectUrl = _URL.createObjectURL(file);
                img.onload = function () {
                    const w = this.width;
                    const h = this.height;
                    _URL.revokeObjectURL(objectUrl);
                    console.log(`img ${w}px x ${h}px`);
                    res({ x: w, y: h });
                };
                img.src = objectUrl;
            } else {
                err();
            }
        });
    },
    isImageSizeCorrect(x, y) {
        let w = Sys.settings.avatar_image_max_with;
        let h = Sys.settings.avatar_image_max_height;
        console.log(`input ${x}px x ${y}px`);
        console.log(`max ${w}px x ${h}px`);
        console.log(`State: ${x <= w && y <= h}`);
        if (x <= w && y <= h) return true;
        else return false;
    },
    // Da sistemare dipendenze
    getImageSizeAllowed() {
        let w = Sys.settings.avatar_image_max_with;
        let h = Sys.settings.avatar_image_max_height;
        return [w, h];
    },
    // Da sistemare dipendenze
    getMaxFileSizeAllowed() {
        let size = parseInt(Sys.settings.upload_limit / 1048576);
        return size;
    },
    Base64ToFile(base64String, fileName) {
        // 1. Rimuovi la parte iniziale "data:image/png;base64,"
        const dataURLRegex =
            /^data:(?:image\/png|image\/jpeg|image\/gif);base64,/;
        const base64Data = base64String.replace(dataURLRegex, "");

        // 2. Decodifica la stringa base64
        const binaryString = atob(base64Data);

        // 3. Converti la stringa binaria in un array di byte
        const byteArray = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));

        // 4. Crea un oggetto Blob
        const typeFromDataURL = dataURLRegex.exec(base64String)[1]; // Ottieni il tipo di mime dal dataURL
        const blob = new Blob([byteArray], { type: typeFromDataURL });

        // 5. Crea (facoltativo) un oggetto File
        const file_Name = fileName; // Nome del file (personalizzalo)
        const file = new File([blob], file_Name, { type: blob.type });

        return { blob, file };
    },
    // calcolo della pasqua
    getPasqua(anno) {
        if (anno < 1583) {
            throw new Error(
                "L'algoritmo funziona solo per il calendario gregoriano (anno >= 1583)."
            );
        }

        // Passaggi del metodo di Gauss
        const a = anno % 19;
        const b = Math.floor(anno / 100);
        const c = anno % 100;
        const d = Math.floor(b / 4);
        const e = b % 4;
        const f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3);
        const h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4);
        const k = c % 4;
        const l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const mese = Math.floor((h + l - 7 * m + 114) / 31); // Mese di Pasqua
        const giorno = ((h + l - 7 * m + 114) % 31) + 1; // Giorno di Pasqua

        return new Date(anno, mese - 1, giorno); // Ritorna una data JS (mese 0-indicizzato)
    },
    fireCustomEvent(eventName, element, data) {
        const standardEvents = [
            "click",
            "focus",
            "blur",
            "input",
            "change",
            "submit",
            "reset",
        ];
        const event = standardEvents.includes(eventName)
            ? new Event(eventName)
            : new CustomEvent(eventName, { detail: data });
        element.dispatchEvent(event);
    },
    // Converte qualsiasi data in luxon obj datetime
    toDateTime(date) {
        const from = [
            "fromFormat",
            "fromSQL",
            "fromISO",
            "fromJSDate",
            "fromDateTime",
        ];
        const to = ["toFormat", "yyyy-MM-dd  HH:mm"]; //toFormat('yyyy-MM-dd  HH:mm')
        let dateParsed = { isValid: false }; //simulate luxon datetime invalid date format
        for (const f of from) {
            if (!dateParsed.isValid) {
                if (
                    f == "fromDateTime" &&
                    typeof date != "string" &&
                    date?.isValid
                ) {
                    const ty = DateTime.fromISO(date?.toISO());
                    if (ty.isValid) dateParsed = ty;
                } else if (f == "fromFormat" && typeof date == "string") {
                    const ty = DateTime.fromFormat(date, to[1]);
                    if (ty.isValid) dateParsed = ty;
                } else if (!["fromDateTime", "fromFormat"].includes(f))
                    dateParsed = DateTime[f](date);
                if (dateParsed.isValid) {
                    break;
                }
            }
        }
        return dateParsed;
    },
    // formatta ogni tipo di data in formato stringa
    toDateFormat(date, format = "f", locale = Sys.locale) {
        const data = Tools.toDateTime(date);
        if (data.isValid) return data.setLocale(locale).toFormat(format);
        return data;
    },
    validate(value, method = null) {
        //if methods is a function
        if (typeof method === "function") {
            return method(value);
        } // else is a array use own element as enum to check
        else if (Array.isArray(method)) {
            return method.includes(value);
        } else {
            switch (method) {
                case "text":
                    return Tools.isString(value);
                case "integer":
                    return Tools.isNumber(value);
                case "number":
                    return Tools.isNumerical(value);
                case "currency":
                    return Tools.isNumerical(value, "currency");
                case "isFiscalCode":
                    return Tools.isFiscalCode(value);
                case "isBusinessCode":
                    return Tools.isBusinessCode(value);
                case "unit":
                    return Tools.isNumerical(value, "unit");
                case "boolean":
                    return Tools.isBoolean(value);
                case "date":
                    return Tools.isDate(value);
                case "object":
                    return Tools.isObject(value);
                case "tel":
                case "phone":
                    return Tools.isPhoneNumber(value);
                case "email":
                    return Tools.isEmail(value);
                case "url":
                    return Tools.isUrl(value);
                case "isEmpty":
                case "empty":
                    return Tools.isEmpty(value);
                case "notNull":
                    return !Tools.isNull(value);
                case "isNull":
                    return Tools.isNull(value);
                case "notEmpty":
                    return !Tools.isEmpty(value);
                case "isBooleanTrue":
                    return Tools.isBoolean(value) && value;
                case "isBooleanFalse":
                    return Tools.isBoolean(value) && !value;
                case "isTrue":
                    return (
                        (Tools.isBoolean(value) && value) ||
                        !Tools.isEmpty(value)
                    );
                case "isFalse":
                    return (
                        (Tools.isBoolean(value) && value === false) ||
                        Tools.isEmpty(value) ||
                        Tools.isNull(value) ||
                        Tools.isUndefined(value) ||
                        (Tools.isNumerical(value) && value < 1) ||
                        (Tools.isString(value) && value == "false")
                    );
                case "required":
                default:
                    return !Tools.isEmpty(value);
            }
        }
    },
    getRandomInt(max, min = 0) {
        return Math.min(Math.floor(Math.random() * (max + 1)) + min, max);
    },
    getRandomFloat(max, min = 0) {
        return Math.min(Math.random() * (max + 1) + min + Math.random(), max);
    },
    // Funzione per ottenere il font-size di base (default 16px)
    // Da sistemare dipendenze
    getBaseFontSize() {
        return (
            parseFloat(getComputedStyle(document.documentElement).fontSize) ||
            16
        );
    },
    // PX -> REM
    pxToRem(px, baseFontSize = Tools.getBaseFontSize()) {
        return px / baseFontSize + "rem";
    },
    // REM -> PX
    remToPx(rem, baseFontSize = Tools.getBaseFontSize()) {
        return Math.round(parseFloat(rem) * baseFontSize) + "px";
    },
    // PX -> EM (relativo a un elemento specifico)
    pxToEm(px, parentFontSize = 16) {
        return px / parentFontSize + "em";
    },
    // EM -> PX
    emToPx(em, parentFontSize = 16) {
        return Math.round(parseFloat(em) * parentFontSize) + "px";
    },
    // VH -> PX
    vhToPx(vh) {
        return Math.round((vh * window.innerHeight) / 100) + "px";
    },
    // VW -> PX
    vwToPx(vw) {
        return Math.round((vw * window.innerWidth) / 100) + "px";
    },
    // PX -> VH
    pxToVh(px) {
        return (px / window.innerHeight) * 100 + "vh";
    },
    // PX -> VW
    pxToVw(px) {
        return (px / window.innerWidth) * 100 + "vw";
    },
    fluentValidate(value, method = null) {
        return validateFluent(value, method);
    },
    scaleMapValueInRange(value, fromMin, fromMax, toMin = 0, toMax = 100) {
        return (
            ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin) + toMin
        );
    },
    scaleMapInRange(fromMin, fromMax, toMin = 0, toMax = 100) {
        //return a array with new scaled values
        return [
            Tools.scaleMapValueInRange(fromMin, fromMin, fromMax, toMin, toMax),
            Tools.scaleMapValueInRange(fromMax, fromMin, fromMax, toMin, toMax),
        ];
    },
    scaleValueInRangeArray(value, arraySource, arrayTarget = [0, 100]) {
        return Tools.scaleMapValueInRange(
            value,
            arraySource[0],
            arraySource[1],
            arrayTarget[0],
            arrayTarget[1]
        );
    },
    scaleMapInRangeArray(arraySource, arrayTarget = [0, 100]) {
        //return a array with new scaled values
        return [
            Tools.scaleMapValueInRange(
                arraySource[0],
                arraySource[0],
                arraySource[1],
                arrayTarget[0],
                arrayTarget[1]
            ),
            Tools.scaleMapValueInRange(
                arraySource[1],
                arraySource[0],
                arraySource[1],
                arrayTarget[0],
                arrayTarget[1]
            ),
        ];
    },
};

// Funzione per creare un validatore fluente
function createFluentValidator(initialValue, method = null, criteria = "OR") {
    let isValid = Tools.validate(initialValue, method);
    let lastValue = initialValue;
    let failedStep = null;
    let stepIndex = 0;
    let notNull = false;
    const criteriaAlgorithm = criteria;
    //failedStep = { index: stepIndex, method: valueOrMethod, typeof: typeof valueOrMethod };

    if (!isValid)
        failedStep = {
            index: stepIndex,
            value: initialValue,
            method: method,
            algorithm: criteriaAlgorithm,
            typeof: typeof initialValue,
        };

    function validateFluent(method = null) {
        //const criteria =  criteria;
        let result = Tools.validate(lastValue, method);
        if (method == "required" || method == "notNull") {
            notNull = true;
        }
        switch (criteriaAlgorithm.toLowerCase()) {
            case "or":
                isValid = isValid || result;
                break;
            case "xor":
                isValid = isValid ^ result;
                break;
            case "and":
            default:
                isValid = isValid && result;
        }
        if (!notNull) {
            let isNotNull = Tools.validate(lastValue, "notNull");
            isValid = isValid && isNotNull;
        }
        if (!isValid)
            failedStep = {
                index: stepIndex,
                value: initialValue,
                method: method,
                algorithm: criteriaAlgorithm,
                typeof: typeof initialValue,
            };

        stepIndex++;
        return validator;
    }

    const validator = {
        $validate: validateFluent,
        isValid: () => isValid,
        isInValid: () => !isValid, //legacy
        isNotValid: () => !isValid,
        getFailedStep: () => failedStep,
    };

    return validator;
}

const validateFluent = function (value, method = "required") {
    return createFluentValidator(value, method);
};

const DateFormat = (
    date,
    format,
    params = { default: null, locale: Sys.locale }
) => {
    if (!date || !Tools.isDate(date)) return params.default;
    if (params.locale)
        return DateTime.fromJSDate(date, { locale: params.locale }).toFormat(
            format
        );
    else return DateTime.fromJSDate(date).toFormat(format);
};

const debounceCallback = (function () {
    let inProcess = false;

    return function (func, wait = 200) {
        if (!inProcess) {
            inProcess = true;
            func();
            setTimeout(() => {
                inProcess = false;
            }, wait);
        }
    };
})();

const debounce = async (callback, wait = 200) => {
    // await nextTick();
    debounceCallback(callback, wait);
    await Tools.delay(wait);
    return new Promise((resolve, reject) => {
        resolve(wait);
    });
};

Tools.debounce = debounce;
Tools.debounceCallback = debounceCallback;
Tools.DateFormat = DateFormat;

const Viewport = {};
Viewport.isBreakpointSize = Tools.isBreakpointSize;
Viewport.getWindowSize = Tools.getWindowSize;
Viewport.getBreakpointSize = Tools.getBreakpointSize;
Viewport.pxToRem = Tools.pxToRem;
Viewport.remToPx = Tools.remToPx;
Viewport.pxToEm = Tools.pxToEm;
Viewport.emToPx = Tools.emToPx;
Viewport.vhToPx = Tools.vhToPx;
Viewport.vwToPx = Tools.vwToPx;
Viewport.pxToVh = Tools.pxToVh;
Viewport.pxToVw = Tools.pxToVw;
Viewport.getBaseFontSize = Tools.getBaseFontSize;

const Seed = {};
Seed.getTime = Tools.getTime;
Seed.getNewIndex = Tools.GetNewIndex;
Seed.getNewId = Tools.GetNewId;
Seed.generateUniqueString = Tools.GenerateUniqueString;
// Assegna ogni funzione random* a Seed
Object.keys(Tools)
    .filter((key) => key.toLowerCase().includes("random"))
    .forEach((key) => {
        switch (key) {
            // case "isHomeLocation":null;break;
            default:
                Seed[key] = Tools[key];
        }
    });

const Mathematics = {};
Mathematics.scaleMapValueInRange = Tools.scaleMapValueInRange;
Mathematics.scaleMapInRange = Tools.scaleMapInRange;
Mathematics.scaleMapInRangeArray = Tools.scaleMapInRangeArray;
Mathematics.getPasquaDate = Tools.getPasqua;

Mathematics.scaleToPercent = (
    percent,
    max,
    min = 0,
    clamped = { min: false, max: false }
) => {
    return Mathematics.clamp(
        Mathematics.scaleMapValueInRange(percent, 0, 100, min, max),
        clamped?.min,
        clamped?.max
    );
};
Mathematics.scaleToAlpha = (
    alpha,
    max,
    min = 0,
    clamped = { min: false, max: false }
) => {
    return Mathematics.clamp(
        Mathematics.scaleMapValueInRange(alpha, 0, 1, min, max),
        clamped?.min,
        clamped?.max
    );
};
Mathematics.scaleToEta = (
    eta,
    max,
    min = 0,
    clamped = { min: false, max: false }
) => {
    return Mathematics.clamp(
        Mathematics.scaleMapValueInRange(eta, -1, 1, min, max),
        clamped?.min,
        clamped?.max
    );
};

Mathematics.toPercent = (
    value,
    max,
    min = 0,
    clamped = { min: false, max: false }
) => {
    return Mathematics.clamp(
        Mathematics.scaleMapValueInRange(value, min, max, 0, 100),
        clamped?.min,
        clamped?.max
    );
};
Mathematics.toAlpha = (
    value,
    max,
    min = 0,
    clamped = { min: false, max: false }
) => {
    return Mathematics.clamp(
        Mathematics.scaleMapValueInRange(value, min, max, 0, 1),
        clamped?.min,
        clamped?.max
    );
};
Mathematics.toEta = (
    value,
    max,
    min = 0,
    clamped = { min: false, max: false }
) => {
    return Mathematics.clamp(
        Mathematics.scaleMapValueInRange(value, min, max, -1, 1),
        clamped?.min,
        clamped?.max
    );
};
Mathematics.clamp = (value, min = null, max = null) => {
    if ((min == null || max == null || min === false, max === false))
        return value;
    if (!max && min) return Math.min(value, min);
    else if (!min && max) return Math.max(value, max);
    else return Math.min(Math.max(value, min), max);
};
Object.keys(Seed)
    .filter((key) => key.toLowerCase().includes("random"))
    .forEach((key) => {
        switch (key) {
            // case "isHomeLocation":null;break;
            default:
                Mathematics[key] = Seed[key];
        }
    });
Object.keys(Viewport)
    .filter((key) => key.includes("To"))
    .forEach((key) => {
        switch (key) {
            // case "isHomeLocation":null;break;
            default:
                Mathematics[key] = Viewport[key];
        }
    });

const FileUtils = {};
FileUtils.fileToBase64 = Tools.fileToBase64;
FileUtils.base64ToFile = Tools.base64ToFile;
FileUtils.trimJson = Tools.trimJson;
FileUtils.getImageSize = Tools.getImageSize;
FileUtils.isImageSizeCorrect = Tools.isImageSizeCorrect;
FileUtils.getImageSizeAllowed = Tools.getImageSizeAllowed;
FileUtils.getMaxFileSizeAllowed = Tools.getMaxFileSizeAllowed;

const Flow = {};
Flow.debounce = debounce;
Flow.debounceCallback = debounceCallback;
Flow.validate = validateFluent;
Flow.delay = Tools.delay;
Flow.waitUntil = Tools.waitUntil;
Flow.toggleImpulse = Tools.toggleImpulse;
Flow.condizionalDelay = Tools.condizionalDelay;

const Logical = {};
Logical.validateCallback = Tools.validate;
Logical.validate = Tools.fluentValidate;
// Assegna ogni funzione is* a Logical
Object.keys(Tools)
    .filter((key) => key.startsWith("is"))
    .forEach((key) => {
        switch (key) {
            case "isHomeLocation":
            case "isImageSizeCorrect":
            case "isBreakpointSize":
                null;
                break;
            default:
                Logical[key] = Tools[key];
        }
    });

const Sys = {
    //env:env,
    Hook: () => Hook,

    // register SessionStorage doc to vue
    Storage() {
        return Sys.$window?.sessionStorage;
    },

    // register window location to vue
    Location() {
        return Sys.$window?.location?.href;
    },

    // register window history to vue
    History() {
        return Sys.$window?.history;
    },

    // register window location to vue
    SiteOrigin() {
        return Sys.$window?.location?.origin;
    },

    // register window location to vue
    LocalOrigin() {
        return Sys.$window?.location?.href?.split("?")[0];
    },

    // register window,document doc to vue
    Document() {
        return Sys.$window?.document;
    },

    Window() {
        return Sys.$window;
    },

    VueApp() {
        return Sys.settings?.vue_app_instance;
    },

    settings: {
        upload_limit: 104857000,
        avatar_image_max_with: 708,
        avatar_image_max_height: 945,
        api_prefix: "api",
        axios_instance: axios ? axios : Sys.$window?.axios,
        jquery_instance:  null,//override it if import jquery from node_modules
        vue_app_instance: null,
    },
    $window: null,
    locale: "it-IT",
    currency: "EUR",
    theme: {
        breakpoints: {
            //as bootstrap
            xxs: 0,
            xs: 376,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xl2: 1280, // Nuovo valore intermedio tra xl e xxl
            xl3: 1366, // Nuovo valore intermedio tra xl e xxl (1366px usato spesso nei monitor standard)
            xxl: 1400,
            xxl2: 1536, // Risoluzione intermedia (es. monitor ultrawide da 1536px)
            xxl3: 1680, // Risoluzione intermedia (es. display grandi con larghezza 1680px)
            xxl4: 1800, // Valore intermedio prima dei 2k
            "2k": 1920,
            "2.5k": 2304, // Risoluzione tra 2k e 4k (2304px es. per alcuni monitor ultrawide)
            "3k": 2880, // Altro valore tra 2k e 4k (2880px es. per certi display Retina)
            "4k": 2560,
            "5k": 3840,
            "6k": 5120,
            "8k": 7680,
        },
    },
};
// register axios to Sys
Sys.Axios = Sys.settings?.axios_instance;
// register jquery  to Sys
Sys.JQuery =Sys?.settings?.jquery_instance ?? Sys?.$window?.$;

const Format = {};
Format.currency = (number = 0, locale = null, currency = null) => {
    if (locale === null) locale = Sys.locale;
    if (currency === null) currency = Sys.currency;
    const numberFormat = Tools.isNaN(Number(number)) ? null : Number(number);
    if (numberFormat === null) return null;
    return numberFormat.toLocaleString(locale, {
        style: "currency",
        currency: currency,
    });
};

Format.signedCurrency = (number = 0, locale = null, currency = null) => {
    if (locale === null) locale = Sys.locale;
    if (currency === null) currency = Sys.currency;
    const numberFormat = Tools.isNaN(Number(number)) ? null : Number(number);
    if (numberFormat === null) return null;
    return (
        (number < 0 ? "" : "+") +
        numberFormat.toLocaleString(locale, {
            style: "currency",
            currency: currency,
        })
    );
};

Format.sign = (number = 0, locale = null) => {
    const numberFormat = Tools.isNaN(Number(number)) ? null : Number(number);
    if (locale === null) locale = Sys.locale;
    if (numberFormat === null) return null;
    return (number < 0 ? "" : "+") + numberFormat.toLocaleString(locale);
};
Format.capitalize = (string = "") => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
Format.uppercase = (string = "") => {
    return string.toUpperCase();
};
Format.lowercase = (string = "") => {
    return string.toLowerCase();
};
Format.slugify = (string = "") => {
    return string
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
};
Format.titleCase = (string = "") => {
    return string
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
Format.underscore = (string = "") => {
    return string
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ /g, "_");
};
// Proxy from Tools
Format.toDateFormat = Tools.DateFormat;
Format.toDateTime = Tools.toDateTime;

const Navigation = {
    SiteOrigin() {
        return Sys.SiteOrigin();
    },
    LocalOrigin() {
        return Sys.LocalOrigin();
    },
};
Navigation.isHomeLocation = (url = false) => {
    return Tools.isHomeLocation(url);
};
//[App navigations and endpoints]
Navigation.Api = (path, version = 1) => {
    const origin = Navigation.SiteOrigin();
    const prefix = `${Sys.settings.api_prefix}/v${version}`;
    path = path.replace("/api/", "");
    //replace di qualsiasi pattern che inizia con /v un numero e termina con / ( /v*/)
    path = path.replace(/\/v[0-9]+\/?/g, "");
    path = path.startsWith("/") ? path.substring(1) : path;
    console.log("call Api: " + `${origin}/${prefix}/${path}`);
    return `${origin}/${prefix}/${path}`;
};
Navigation.Url = (path, relative = false) => {
    const origin = Navigation.SiteOrigin();
    const relativeOrigin = Navigation.LocalOrigin();
    // const prefix=Sys.settings.api_prefix;
    return relative ? `${relativeOrigin}/${path}` : `${origin}/${path}`;
};
Navigation.GetQueryParams = (name = null) => {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    if (name) return params[name];
    return params;
};
Navigation.GoTo = (path, relative = false) => {
    if (Sys.$window) Sys.$window.location = Navigation.Url(path, relative);
};
Navigation.GoToAbsolute = (path) => {
    if (Sys.$window) Sys.$window.location = path;
};
Navigation.GoBack = () => {
    if (Sys.$window) Sys.$window.history.back();
};
Navigation.GoForward = () => {
    if (Sys.$window) Sys.$window.history.forward();
};
Navigation.Download = (path, relative = false) => {
    let file_path = Navigation.Url(path, relative);
    let document = Sys.Document();
    if (!document) return;
    let a = document.createElement("A");
    a.href = file_path;
    a.download = file_path.substr(file_path.lastIndexOf("/") + 1);
    // console.log(a.href,a.download);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
Navigation.Reload = () => {
    if (Sys.$window) Sys.$window.location.reload();
};

Navigation.BaseUrl = () => {
    if (!Sys.$window) return;
    return Sys.SiteOrigin();
};

Navigation.CurrentLocation = () => {
    if (!Sys.$window) return;

    return Sys.$window.location.pathname;
};
Navigation.isCurrentLocation = (path = null) => {
    if (!Sys.$window) return;

    if (!path) path = Sys.$window.location.pathname;
    return Sys.$window.location.pathname.endsWith(path);
};

const DOMUtils = {};
DOMUtils.fireCustomEvent = Tools.fireCustomEvent;
DOMUtils.getBaseFontSize = Tools.getBaseFontSize;
DOMUtils.pxToRem = Tools.pxToRem;
DOMUtils.remToPx = Tools.remToPx;
DOMUtils.pxToEm = Tools.pxToEm;
DOMUtils.emToPx = Tools.emToPx;
DOMUtils.vhToPx = Tools.vhToPx;
DOMUtils.vwToPx = Tools.vwToPx;
DOMUtils.pxToVh = Tools.pxToVh;
DOMUtils.pxToVw = Tools.pxToVw;
DOMUtils.getWindowSize = Tools.getWindowSize;
DOMUtils.isBreakpointSize = Tools.isBreakpointSize;
DOMUtils.getBreakpointSize = Tools.getBreakpointSize;
DOMUtils.axios = Sys.Axios;
DOMUtils.$ = Sys.JQuery;
DOMUtils.JQuery = Sys.JQuery;
DOMUtils.document = Sys.Document;

export {
    Format,
    Navigation,
    Sys,
    Tools,
    Seed,
    Flow,
    Logical,
    DOMUtils,
    Mathematics,
    FileUtils,
};

export { createEnum };
