define(function () {
    var fontsList=
        [
            {
                displayName: "default",
                fontFamily: "default",
                url: undefined,
            },
            {
                displayName: "Bitter",
                fontFamily: "Bitter",
                url: "https://fonts.googleapis.com/css?family=Bitter"
            },
            {
                displayName: "Open Dyslexic",
                fontFamily: "OpenDyslexic",
                url: "http://localhost:63342/readium-js/dev2/fonts/OpenDyslexic/OpenDyslexic.css"
            },
            {
                displayName: "Open Sans",
                fontFamily: "Open Sans",
                url: "http://localhost:63342/readium-js/dev2/fonts/Open-Sans/Open-Sans.css"
            },
            {
                displayName: "Noto Serif",
                fontFamily: "Noto Serif",
                url: "http://localhost:63342/readium-js/dev2/fonts/Noto-Serif/Noto-Serif.css"
            }
        ];

    return  {
        getFontFaces: function () {
            return fontsList;
        },
    }
})
