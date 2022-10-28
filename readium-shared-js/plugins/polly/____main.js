/** * This plugin helps to properly load the Hypothes.is client with Readium. * Enable this plugin if you want to add the Hypothesis client to your reader * so that visitors can annotate EPUBs without having to install * the Hypothesis browser extension. */define('readium_plugin_polly/main',['readium_js_plugins', 'readium_shared_js/globals'], function (Plugins,Globals) {    var H_EMBED_URL = 'https://sdk.amazonaws.com/js/aws-sdk-2.410.0.min.js';    Plugins.register("polly", function (api) {        var self = this;        var reader = api.reader, _highlightsManager, _initialized = false, _initializedLate = false;        self._viewport = document.getElementById('viewport');        self._body = {};        self._objectToJson = {};        self._textPartSpans = [];        self.myWords = new Map();        // Inject the script        var script = document.createElement('script');        script.setAttribute('src', H_EMBED_URL);        script.setAttribute('async', 'true');        document.head.appendChild(script);        this.init = function () {            AWS.config.region = 'us-east-1';            AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'us-east-1:9e348431-fd20-446f-a859-26c395db4e30'});            window.AWS = AWS;        }        this.speakText = function (text) {            // Create the JSON parameters for getSynthesizeSpeechUrl            var speechParams = {                OutputFormat: "mp3",                SampleRate: "16000",                Text: `<speak>${text}</speak>`,                TextType: "ssml",                VoiceId: "Matthew"            };            <!-- snippet-end:[Polly.HTML.BrowserExample.config] -->            <!-- snippet-start:[Polly.HTML.BrowserExample.synthesize] -->            // Create the Polly service object and presigner object            var polly = new AWS.Polly({apiVersion: '2016-06-10'});            var signer = new AWS.Polly.Presigner(speechParams, polly)            // Create presigned URL of synthesized speech file            signer.getSynthesizeSpeechUrl(speechParams, function(error, url) {                if (error) {                    document.getElementById('result').innerHTML = error;                } else {                    document.getElementById('audioSource').src = url;                    document.getElementById('audioPlayback').load();                    document.getElementById('result').innerHTML = "Speech ready to play.";                }            });        }        this.synthesizePageContent = function () {            const spine = ReadiumSDK.reader.getPaginationInfo().openPages[0];            const {context} = ReadiumSDK.reader.getElements(spine.idref);            const {body} = ReadiumSDK.reader.getElements(spine.idref)[1];            console.log('context', context)            this.speakText(context.innerText);         //   this.getJSON(context.innerText);          //  console.log('innerText', context.innerText)          //  this.getJSON(context.innerText);        }        let tmpColor = '';        let timeout;        function addWordToDictionary(element){            clearTimeout(timeout);            const word = element.innerText.toLowerCase();            if(self.myWords.get(word) === undefined) {                self.myWords.set(word, 1);            } else {                self.myWords.set(word, self.myWords.get(word)+1);            }            console.log(self.myWords);            let str = '';            var mapAsc = new Map([...self.myWords.entries()].sort());            mapAsc.forEach((value, key, map) => {                 str += `${key} - ${value}<br>`;            });            document.getElementById('dictionary').innerHTML = str;        }        function addHighlight(element) {            console.log(element)            tmpColor = element.style.color;            element.style.color = 'red';            timeout = setTimeout(() => {                addWordToDictionary(element)            }, 3000);        }        function removeHighlight(element) {            clearTimeout(timeout);            element.style.color = tmpColor;        }        this.getTextParts = function () {            var regExp = /[a-zA-Z]/g;            const spine = ReadiumSDK.reader.getPaginationInfo().openPages[0];            const body = ReadiumSDK.reader.getElements(spine.idref)[1];            let str = body.innerHTML;            let start = 0;            let length = str.length;            let spansCount = 0            for (let i = 0 ; i < length ; i++) {                if (str[i] === '>') { start = i;}                if (str[i] === '<') {                    if(i - start) {                        const text = str.substring(start + 1, i);                        if (text !== undefined && regExp.test(text)) {                            let newText = `<span id="spanHL${spansCount++}">${text}</span>`;                            str = str.substring(0, start+1) + newText + str.substring(i);                            length += (newText.length - text.length);                            i += (newText.length - text.length);                        }                    }                }            }            body.innerHTML = str;            self._textPartSpans = [];            for (let i = 0 ; i < spansCount ; i++) {                const el = body.ownerDocument.getElementById(`spanHL${i}`);                self._textPartSpans.push(el);            }        }        var speechParams = {            OutputFormat: "json",            Text:  '',            TextType: "text",            VoiceId: "Matthew",            SpeechMarkTypes: ['word'], //'sentence', 'word', 'ssml', 'viseme'        };        this.getJSON = function () {            this.getTextParts();            var polly = new AWS.Polly({apiVersion: '2016-06-10'});            console.log(self._textPartSpans);            let text = '';// = '<speak>';            self._textPartSpans.forEach((e) => {               let str = e.innerText;               text += (`${str} `);            });         //   text += '</speak>';            console.log(text);            speechParams.Text = text;            polly.synthesizeSpeech(speechParams, async function(error, data) {                if(error){                    console.log(error);                } else if (data) {                    const contentArray = (new TextDecoder().decode(data.AudioStream)).split("\n");                    self._jsonResponse = [];                    for (let i in contentArray) {                        if (contentArray[i]) {                            self._jsonResponse.push(JSON.parse(contentArray[i]));                        }                    }                    self.addActionsToWords();                }            });        }        this.addActionsToWords = function (){            console.log(self._textPartSpans, self._jsonResponse);            let wordIndex = 0;            let pos = 0;            let spanId = 0;            const encoder = new TextEncoder();            self._textPartSpans.forEach((e) => {                let text = e.innerText;                let length = text.length;                let html = '';                for(let i = 0 ; i < length ; i++) {                    if(pos === self._jsonResponse[wordIndex].start){                        const word = self._jsonResponse[wordIndex].value;                        console.log({pos, word, s: text.substring(i)});                        html += `<span id="wordHL${spanId++}">`;                        for(i ; pos < self._jsonResponse[wordIndex].end && i < length ; i++){                            html += text[i];                            pos += encoder.encode(text[i]).length;                        }                        html += '</span>';                        if(wordIndex < self._jsonResponse.length-1){                            wordIndex++;                        }                        i--;                    } else {                        html += text[i];                        pos += encoder.encode(text[i]).length;                    }                }                e.innerHTML = html;                pos++;            });            const spine = ReadiumSDK.reader.getPaginationInfo().openPages[0];            const body = ReadiumSDK.reader.getElements(spine.idref)[1];            for (let i = 0 ; i < spanId ; i++) {                const el = body.ownerDocument.getElementById(`wordHL${i}`);                el.onmouseover = () => {addHighlight(el)};                el.onmouseout = () => {removeHighlight(el)};                el.onclick = () => {addWordToDictionary(el)};                console.log(el);            }        }    });});define('readium_plugin_polly', ['readium_plugin_polly/main'], function (main) { return main; });