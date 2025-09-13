const Instances = {
    game: {
        width: 400,
        height: 420,
        bg: "#f8f9fa",
        boot: "boot",
        preload: "preload",
        start: "start",
    },
    text: {
        status: "Draw flexible lines to connect same colors!",
        hintText: "💡 Connect pairs without crossing lines or other balls.",
    },
    image: {
        key: {
            bg: "background",
            logo: "logo",
        },
        value: {
            bg: "images/bg.png",
            logo: "images/logo.png",
        },
    },
    audio: {
        key: {
            bg: "bg-music",
            connect: "connect",
            cancel: "cancel",
            click: "click",
            empty: "empty",
            win: "win",
            wrong: "wrong",
        },
        value: {
            bg: "audios/bg_music.ogg",
            connect: "audios/connect.ogg",
            cancel: "audios/cancel.ogg",
            click: "audios/click.mp3",
            empty: "audios/empty.ogg",
            win: "audios/win.ogg",
            wrong: "audios/wrong.wav",
        },
    },
    colors: [
        { key: "red", hex: 0xe74c3c },
        { key: "blue", hex: 0x3498db },
        { key: "green", hex: 0x2ecc71 },
        { key: "orange", hex: 0xf39c12 },
        { key: "purple", hex: 0x9b59b6 },
    ],
};

export const { game, text, image, audio, colors } = Instances;
export const { width, height, bg, boot, preload, start } = game;
export const { status, hintText } = text;
