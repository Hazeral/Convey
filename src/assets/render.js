const fs = require('fs');
const path = require('path');
const soundsFolder = path.join(__dirname, 'sounds');
let allSounds = [];
const portAudio = require('naudiodon');
let binds = [];
const ofe = require('open-file-explorer');
const jsonfile = require('jsonfile');
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
        if (file.split('.')[file.split('.').length - 1] == 'wav') {
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
        <div class="numDiv" style="display: none">
            <span class="heading">${allSounds.length} file(s) found</span>
            <a class="icon is-small refreshList" onclick="refreshList()"><i class="fas fa-redo" aria-hidden="true"></i></a>
        </div>
    `);
    if (allSounds.length == 0) return;
    $('.allBox').append(`
        <div class="container file-list has-text-centered" style="display: none"></div>
    `);
    allSounds.forEach(sound => {
        $('.file-list').append(`
            <div id="${sound.id}" class="file">
                <div>
                    <span>${(sound.name.length > 12) ? (sound.name.substring(0, 9) + '...') : sound.name}</span>
                </div>
                <button onclick="play('${sound.id}')" id="${sound.id}-play" class="button is-small">Play</button>
                <button onclick="openModal('${sound.id}')" id="${sound.id}-bind" class="button is-small">Bind key</button>
            </div>
        `);
    });
    $('.numDiv').fadeIn();
    $('.file-list').fadeIn();
    $('.progressBox').fadeOut();
}

async function refreshList() {
    $('.progressBox').append(progressHtml);
    $('.allBox').empty();
    await addSounds();
}

function openFolder() {
    ofe(soundsFolder, err => console.log(err));
}

function play(id) {  
    let ao = new portAudio.AudioIO({
        outOptions: {
          channelCount: 2,
          sampleFormat: portAudio.SampleFormat16Bit,
          sampleRate: 48000,
          deviceId: -1,
          closeOnError: true
        }
    });

    let name;
    allSounds.map(s => {
        if (s.id == id) {
            name = s.name;
        }
    });

    let rs = fs.createReadStream(path.join(soundsFolder, name));
    rs.pipe(ao);
    ao.start();
}

function openModal(id) {
    let name;
    allSounds.map(s => {
        if (s.id == id) {
            name = s.name;
        }
    });
    $('.key-input').attr('value', '');
    $('.bind-button').remove();
    $('.m-title').text('Bind key for: ' + name);
    $('.modal-c').append(`
        <button class="button is-info bind-button" onclick="bind('${id}')">Bind</button>
        <button class="button is-info bind-button" onclick="unBind('${id}')">Unbind</button>
    `);
    $('.modal').attr('class', 'modal is-active');
}

function hideModal() {
    $('.modal').attr('class', 'modal');
}

function bind(id) {
    let name;
    allSounds.map(s => {
        if (s.id == id) {
            name = s.name;
        }
    });
    if ($('.key-input').val() != undefined && $('.key-input').val() != '') {
        let obj = {
            bind: $('.key-input').val(),
            name: name,
            id: id
        };
        binds.map(b => {
            if(b.id == id) {
                binds.pop(b);
            }
        });
        binds.push(obj);
        jsonfile.writeFile(path.join(soundsFolder, '/binds.json'), binds, (err) => {
            if (err) console.error(err)
        });
        hideModal();
    }
}

function unBind(id) {
    binds.map(b => {
        if(b.id == id) {
            binds.pop(b);
        }
    });
    jsonfile.writeFile(path.join(soundsFolder, '/binds.json'), binds, (err) => {
        if (err) console.error(err)
    });
    hideModal();
}

function checkBind(e) {
    if ($('.modal').hasClass('is-active')) {
        e.preventDefault();
    }

    let kp = [];
    if (e.ctrlKey) {
        kp.push('ctrl');
    }
    if (e.shiftKey) {
        kp.push('shift');
    }
    if (e.altKey) {
        kp.push('alt');
    }
    kp.push(e.key);
    let pressed = kp.join('+');
    $('.key-input').attr('value', pressed);
    // if bind is set then play sound
    binds.map(b => {
        if (b.bind == pressed) {
            console.log(b)
            play(b.id);
        }
    });
}

$(() => {
    document.addEventListener('keypress', e => checkBind(e));

    refreshList();
});