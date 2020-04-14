const fs = require('fs');
const path = require('path');
const soundsFolder = path.join(__dirname, 'sounds');
let allSounds = [];
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const progressHtml = `<progress class="progress is-small is-dark" max="100">15%</progress>`;

function gen_id() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 10; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function getSounds() {
    allSounds = [];
    await fs.readdirSync(soundsFolder).forEach(file => {
        if (file.split('.')[file.split('.').length - 1] != 'mp3' || file.split('.')[file.split('.').length - 1] != 'wav') {
            if (allSounds.some(f => f.name === file)) return;
            let file_id = gen_id();
            allSounds.push({ id: file_id, name: file });
        }
        return;
    });
}

async function addSounds() {
    await getSounds();
    $('.allBox').append(`
        <div class="numDiv">
            <span class="heading">${allSounds.length} file(s) found</span>
            <a class="icon is-small refreshList" onclick="refreshList()"><i class="fas fa-redo" aria-hidden="true"></i></a>
        </div>
    `);
    if (allSounds.length == 0) return;
    $('.allBox').append(`
        <div class="container file-list has-text-centered"></div>
    `);
    allSounds.forEach(sound => {
        $('.file-list').append(`
            <div id="${sound.id}" class="file">
                <div>
                    <span>${sound.name}</span>
                    <a onclick="addFavourite('${sound.id}')" id="${sound.id}-fav" class="icon is-small setFavourite"><i class="far fa-star" aria-hidden="true"></i></a>  
                </div>
                <button onclick="play('${sound.id}')" id="${sound.id}-play" class="button is-small">Play</button>
                <button onclick="stop('${sound.id}')" id="${sound.id}-stop" class="button is-small">Stop</button>
                <button onclick="bind('${sound.id}')" id="${sound.id}-bind" class="button is-small">Bind key</button>
            </div>
        `);
    });
    $('.progressBox').empty();
}

async function refreshList() {
    $('.progressBox').append(progressHtml);
    $('.allBox').empty();
    await addSounds();
}

function addFavourite(id) {}

function play(id) {}

function stop(id) {}

function bind(id) {}

$(() => {
    refreshList();
});