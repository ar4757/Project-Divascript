var config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    parent: 'container',
    transparent: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var header;
var footer;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var w, a, s, d;
var p;
var currentKey;
var editMode = false;
var editorNotes;
var noteTimings;
var incomingNotes;
var timerHands;
var currentTime;
var videoID;

var game = new Phaser.Game(config);

var progressDiv;

var progressBar;

var selector;

var list;

var paused = false;

var editText;

var editContainer;

var saveContainer;

var submitContainer;

var editParagraph;

var homeContainer;

var timeouts = [];

var countdown;

var countdownText;

var interval;

var thumbImg;

var listIndex = 0;

var fireEvent = true;
var newDelta, oldDelta, eventTimeout;
newDelta = oldDelta = eventTimeout = null;

var duration = 2;

var bgd;
var fgd;

var pauseContainer;

var holding = false;

function preload ()
{
    this.load.image('bar', 'assets/bar.png');
    this.load.image('square', 'assets/square.png');
    this.load.image('circle', 'assets/circle.png');
    this.load.image('cross', 'assets/cross.png');
    this.load.image('triangle', 'assets/triangle.png');
    this.load.image('inverted-square', 'assets/inverted-square.png');
    this.load.image('inverted-circle', 'assets/inverted-circle.png');
    this.load.image('inverted-cross', 'assets/inverted-cross.png');
    this.load.image('inverted-triangle', 'assets/inverted-triangle.png');
    this.load.image('cool01', 'assets/cool01.png');
    this.load.image('cool02', 'assets/cool02.png');
    this.load.image('cool03', 'assets/cool03.png');
    this.load.image('fine01', 'assets/fine01.png');
    this.load.image('fine02', 'assets/fine02.png');
    this.load.image('wrong01', 'assets/wrong01.png');
    this.load.image('wrong02', 'assets/wrong02.png');
    this.load.image('wrong03', 'assets/wrong03.png');
    this.load.image('wrong04', 'assets/wrong04.png');
    this.load.image('safe', 'assets/safe.png');
    this.load.image('sad', 'assets/sad.png');
    this.load.image('worst', 'assets/worst.png');
    this.load.image('timerhand', 'assets/timerhand.png');
    this.load.image('edit-mode', 'assets/edit-mode.png');
    this.load.image('edit-mode-background', 'assets/edit-mode-background.png');
    this.load.image('save-edit', 'assets/save-edit.png');
    this.load.image('submit-text', 'assets/submit-text.png');
    this.load.image('home', 'assets/home.png');
    this.load.image('retry', 'assets/retry.png');
    this.load.image('songselect-foreground', 'assets/songselect-foreground.png');
    this.load.image('songselect-background', 'assets/songselect-background.png');
    this.load.image('songselect-other', 'assets/songselect-other.png');
    this.load.image('songselect-bg', 'assets/songselect-bg.png');
    this.load.audio('button1', 'sound/button1.wav');
    this.load.audio('music-selector-select', 'sound/music-selector-select.wav');
    this.load.audio('music-selector-enter', 'sound/music-selector-enter.wav');
    this.load.audio('bgm', 'sound/bgm.wav');

    this.load.image('header-left', 'assets/header-left.png');
    this.load.image('header-right', 'assets/header-right.png');

    this.load.image('game01', 'assets/game01.png');
    this.load.image('game02', 'assets/game02.png');

    this.load.image('edit01', 'assets/edit01.png');
    this.load.image('edit02', 'assets/edit02.png');

    this.load.image('footer-black', 'assets/footer-black.png');

    this.load.image('footer-blue', 'assets/footer-blue.png');
    this.load.image('footer-green', 'assets/footer-green.png');

    this.load.image('footer-controls', 'assets/footer-controls.png');

    this.load.image('pause-plate', 'assets/pause-plate.png');

    this.load.image('hold', 'assets/hold.png');
}

function create ()
{

    this.sound.setVolume(0.25);

    this.sound.play('bgm');

    header = this.physics.add.staticGroup();

    header.create(310, 32, 'header-left');
    header.create(336 + 330, 32, 'header-right');

    footer = this.physics.add.staticGroup();

    footer.create(400, 568, 'footer-black');

    footer.create(300, 568, 'footer-controls').setScale(0.5);

    footer.create(200, 568, 'footer-green').setScale(0.38);

    var game01 = this.add.image(0, 0, 'game01').setScale(0.25).setInteractive();
    var game02 = this.add.image(0, 0, 'game02').setScale(0.25);

    var gameContainer = this.add.container(150, 568, [ game01, game02 ]);

    game01.addListener('pointerup', goHome, this);

    var edit01 = this.add.image(0, 0, 'edit01').setScale(0.25).setInteractive();
    var edit02 = this.add.image(0, 0, 'edit02').setScale(0.25);

    var editContainer = this.add.container(250, 568, [ edit01, edit02 ]);

    edit01.addListener('pointerup', editor, this);

    var saveBg = this.add.image(0, 0, 'edit-mode-background').setInteractive();
    var saveText = this.add.image(0, 0, 'save-edit');

    saveContainer = this.add.container(700, 34, [ saveBg, saveText ]);

    saveBg.addListener('pointerup', editor, this);

    saveContainer.visible = false;

    var pauseBg = this.add.image(0, 0, 'pause-plate').setInteractive();
    var pauseText = this.add.text(-50, -10, 'RETRY', { fontFamily: 'icomoon', fontSize: '32px', fill: '#000000'});

    pauseContainer = this.add.container(400, 300, [ pauseBg, pauseText ]);

    pauseBg.addListener('pointerup', function() {pauseGame(this); startSong(this, true);}, this);

    pauseContainer.visible = false;

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    p = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    //  The score
    scoreText = this.add.text(16, 96, 'Score: 0', { fontSize: '32px', fill: '#FFFFFF' });

    scoreText.visible = false;

    editorNotes = this.physics.add.staticGroup();

    noteTimings = this.physics.add.staticGroup();
    incomingNotes = this.physics.add.staticGroup();
    timerHands = this.physics.add.staticGroup();


    //generateNotes();

    progressDiv = document.getElementById('progress');
    progressDiv.style.position = 'absolute';
    progressDiv.style.top = '550px';
    progressDiv.style.left = '300px';
    progressBar = document.createElement('input');
    progressBar.type = 'range';
    progressBar.min = '0';
    progressBar.max = '0';
    progressBar.step = '5';
    progressBar.value = '0';
    progressDiv.appendChild(progressBar);

    progressBar.addEventListener('input', function (e) {

        player.seekTo(e.target.value);

    });

    progressBar.style.visibility = 'hidden';

    var xhr = new XMLHttpRequest();
    console.log(location.hostname);
    if (location.hostname == "localhost") {
        xhr.open( 'get', 'song_list.php', true );
    }
    else {
        xhr.open( 'get', 'song_list_heroku.php', true );
    }
    xhr.send();


    selector = document.getElementById('selector');

    list = document.createElement('LI');
    list.style.listStyle = 'none';
    list.style.position = 'absolute';
    list.style.top = '64px';
    list.style.left = '32px';

        setTimeout(function(){
            var songList = JSON.parse(xhr.responseText);
            for (var i = 0; i < songList.length; i++) {
                var array = songList[i].split(/-(.+)/);
                var currentVideoID = array[0];
                var currentTitle = array[1].substr(0,34);

                /*var bgd = document.createElement("img");
                bgd.src = "assets/songselect-background.png";
                bgd.style.width = '460px';
                bgd.style.height = '90px';
                bgd.style.float = 'left';
                bgd.style.objectFit = 'contain';
                bgd.style.position = 'absolute';
                bgd.style.zIndex = '-30';*/

                /*var fgd = document.createElement("img");
                fgd.src = "assets/songselect-foreground.png";
                fgd.style.width = '460px';
                fgd.style.height = '90px';
                fgd.style.float = 'left';
                fgd.style.objectFit = 'contain';*/

                var other = document.createElement("img");
                other.src = "assets/songselect-other.png";
                other.style.width = '460px';
                other.style.height = '90px';
                other.style.float = 'left';
                other.style.objectFit = 'contain';
                other.style.position = 'absolute';
                other.style.zIndex = '10';

                var textContainer = document.createElement("div");
                textContainer.style.height = '16px';
                textContainer.style.position = 'relative';
                textContainer.style.top = '30px';
                textContainer.style.left = '106px';
                textContainer.style.fontFamily = 'icomoon';
                textContainer.style.color = 'white';
                textContainer.style.letterSpacing = '-8px';
                textContainer.style.zIndex = '30';

                var videoIDContainer = document.createElement("div");
                videoIDContainer.style.position = 'relative';
                videoIDContainer.style.bottom = '74px';
                videoIDContainer.style.left = '70px';
                videoIDContainer.style.visibility = 'hidden';

                var titletextnode = document.createTextNode(currentTitle);
                textContainer.appendChild(titletextnode);
                var br = document.createElement("br");
                var idlabelnode = document.createTextNode("Video ID: ");
                var idtextnode = document.createTextNode(currentVideoID);
                videoIDContainer.appendChild(idlabelnode);
                videoIDContainer.appendChild(idtextnode);
                var paragraph = document.createElement('P');
                paragraph.style.marginBottom = '-14px';
                paragraph.appendChild(other);
                paragraph.appendChild(textContainer);
                paragraph.appendChild(br);
                paragraph.appendChild(videoIDContainer);
                //paragraph.addEventListener("click", function() {startSong(this, false);});
                list.appendChild(paragraph);
            }

            selector.appendChild(list);

            thumbImg = document.createElement("img");
                listIndex = 0;
                videoID = list.children[listIndex].lastChild.lastChild.textContent;
                console.log("VideoID Length: " + videoID.length);
                if (videoID.length > 11) {
                    videoID = videoID.substr(0, 11);
                    console.log("New VideoID Length: " + videoID.length);
                }
                thumbImg.src = "http://img.youtube.com/vi/" + videoID + "/0.jpg";
                thumbImg.style.position = 'fixed';
                thumbImg.style.top = '120px';
                thumbImg.style.left = '500px';
                thumbImg.style.width = '288px';
                thumbImg.style.height = '192px';
                thumbImg.style.float = 'right';
                thumbImg.style.objectFit = 'contain';

            selector.appendChild(thumbImg);

            bgd = document.createElement("img");
                bgd.src = "assets/songselect-background.png";
                bgd.style.width = '460px';
                bgd.style.height = '90px';
                bgd.style.float = 'left';
                bgd.style.objectFit = 'contain';
                bgd.style.position = 'fixed';
                bgd.style.top = '144px';
                bgd.style.left = '30px';
                bgd.style.zIndex = '15';

            fgd = document.createElement("img");
                fgd.src = "assets/songselect-foreground.png";
                fgd.style.width = '460px';
                fgd.style.height = '90px';
                fgd.style.float = 'left';
                fgd.style.objectFit = 'contain';
                fgd.style.position = 'fixed';
                fgd.style.top = '144px';
                fgd.style.left = '30px';
                fgd.style.zIndex = '15';

            selector.appendChild(bgd);
            selector.appendChild(fgd);

            var scrollPadding = "";
            scrollPadding = list.offsetHeight + 354;
            scrollPadding += "px";

            list.style.height = scrollPadding;


            document.addEventListener('keydown', function (e) {
                //console.log(e.which);
                switch (e.which) {
                    case 13:
                        //If in main menu (i.e. no video is ready)
                        if (player.getPlayerState() == 5) {
                            startSong(this, false);
                        }
                        break;
                    case 38:
                        if (player.getPlayerState() == 5) {
                            scrollUp();
                        }
                        break;
                    case 40:
                        if (player.getPlayerState() == 5) {
                            scrollDown();
                        }
                        break;
                }
            });

            //IE, Chrome, Safari, Opera
            document.addEventListener('mousewheel', function (e) {
                var e = window.event || e;
                var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                //var delta = e.wheelDelta || -e.detail;
                e.preventDefault();
                console.log(delta);

                if (!fireEvent) return;
                
                if (player.getPlayerState() != 5) {
                    return;
                }

                newDelta = delta;

                if(oldDelta!=null&&oldDelta*newDelta>0){
                    if (delta > 0) {
                        //console.log(delta);
                        scrollUp();
                    }
                    if (delta < 0) {
                        //console.log(delta);
                        scrollDown();
                    }
                    fireEvent = false;
                    clearTimeout(eventTimeout);
                    eventTimeout = setTimeout(function(){fireEvent = true},200);
                }
                oldDelta = newDelta;
            });

            //Firefox
            document.addEventListener('DOMMouseScroll', function (e) {
                var e = window.event || e;
                var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                //var delta = e.wheelDelta || -e.detail;
                e.preventDefault();
                console.log(delta);

                if (!fireEvent) return;
                
                newDelta = delta;

                if(oldDelta!=null&&oldDelta*newDelta>0){
                    if (delta > 0) {
                        //console.log(delta);
                        scrollUp();
                    }
                    if (delta < 0) {
                        //console.log(delta);
                        scrollDown();
                    }
                    fireEvent = false;
                    clearTimeout(eventTimeout);
                    eventTimeout = setTimeout(function(){fireEvent = true},200);
                }
                oldDelta = newDelta;
            });

            document.addEventListener("click", function (e) {
                var e = window.event || e;
                var y = event.clientY;
                console.log("Y: " + y);
                if (player.getPlayerState() == 5) {
                    if (y >= 56) {
                        if (y <= 156) {
                            e.stopPropagation();
                            scrollUp();
                        }
                        if (y <= 106) {
                            e.stopPropagation();
                            scrollUp();
                        }
                    }
                    if (y > 156 && y < 226) {
                        startSong(this, false);
                    }
                    if (y <= 516) {
                        if (y >= 226) {
                            e.stopPropagation()
                            scrollDown();
                        }
                        if (y >= 276) {
                            e.stopPropagation()
                            scrollDown();
                        }
                        if (y >= 326) {
                            e.stopPropagation()
                            scrollDown();
                        }
                        if (y >= 376) {
                            e.stopPropagation()
                            scrollDown();
                        }
                        if (y >= 426) {
                            e.stopPropagation()
                            scrollDown();
                        }
                        if (y >= 476) {
                            e.stopPropagation()
                            scrollDown();
                        }
                    }
                }
            }, true);


    }, 500);

    editParagraph = document.createElement('P');
    editParagraph.style.position = 'absolute';
    editParagraph.style.top = '52px';
    editParagraph.style.left = '232px';
    editParagraph.style.visibility = 'hidden';
    var editTextlabelnode = document.createTextNode("Video ID: ");
    editParagraph.appendChild(editTextlabelnode);

    editText = document.createElement('input');
    editText.type = 'text';
    editText.style.position = 'absolute';
    editText.style.top = '64px';
    editText.style.left = '300px';
    editText.style.visibility = 'hidden';

    selector.appendChild(editParagraph);
    selector.appendChild(editText);

    var submitBg = this.add.image(0, 0, 'edit-mode-background').setInteractive();
    var submitText = this.add.image(0, 0, 'submit-text');

    submitContainer = this.add.container(384, 34, [ submitBg, submitText ]);

    submitBg.addListener('pointerup', loadEditVideo, this);

    submitContainer.visible = false;

}

function scrollUp() {
    if (listIndex == 0) {
        console.log("TO BOTTOM");
        selector.scrollTop = 54*list.children.length;
        listIndex = list.children.length - 1;
    }
    else {
        console.log("UP");
        selector.scrollTop -= 54;
        if (listIndex > 0) {
            listIndex -= 1;
        }
    }
    videoID = list.children[listIndex].lastChild.lastChild.textContent;
    console.log("VideoID Length: " + videoID);
    if (videoID.length > 11) {
        videoID = videoID.substr(0, 11);
        console.log("New VideoID Length: " + videoID);
    }
    thumbImg.src = "http://img.youtube.com/vi/" + videoID + "/0.jpg";
    game.sound.play('music-selector-select');
}

function scrollDown() {
    if (listIndex == list.children.length - 1) {
        console.log("TO TOP");
        selector.scrollTop = 0;
        listIndex = 0;
    }
    else {
        console.log("DOWN");
        selector.scrollTop += 54;
        if (listIndex < list.children.length - 1) {
            listIndex += 1;
        }
    }
    videoID = list.children[listIndex].lastChild.lastChild.textContent;
    console.log("VideoID Length: " + videoID);
    if (videoID.length > 11) {
        videoID = videoID.substr(0, 11);
        console.log("New VideoID Length: " + videoID);
    }
    thumbImg.src = "http://img.youtube.com/vi/" + videoID + "/0.jpg";
    game.sound.play('music-selector-select');
}

function goHome() {
    window.location.reload(true);
}

function startSong(scene, retry) {
    if (retry == true) {
        noteTimings.clear(true, true);
        incomingNotes.clear(true, true);
        timerHands.clear(true, true);
        score = 0;
        scoreText.setText('Score: ' + score);
        player.seekTo(0);
    }
    else {
        game.sound.stopAll();
        var thumbnailLink = "http://img.youtube.com/vi/" + videoID + "/0.jpg";
        thumbnailImg = document.getElementById('thumbnailImg');
        thumbnailImg.style.visibility = 'hidden';
        thumbnailImg.src = thumbnailLink;
        player.loadVideoById(videoID);
        selector.style.visibility = 'hidden';
        list.style.visibility = 'hidden';
        scoreText.visible = true;
        //editContainer.visible = false;
    }
    game.sound.play('music-selector-enter');
    generateNotes();

}

function generateNotes() {
    var beatmap;

    fetch("beatmaps/" + videoID + "/" + "beatmap.txt")
        .then(response => response.text())
        .then(text => beatmap = text);

    //NOTE: Timeout value is important, higher timeout broke everything
    setTimeout(function(){
        var noteArray = beatmap.split("\n");
        var lastNoteIndex = noteArray.length;

        for (var i = 2; i < lastNoteIndex - 1; i++) {
            var currentNote = noteArray[i];
            var currentNoteArray = currentNote.split(",");
            var time = currentNoteArray[0];
            var x = currentNoteArray[1];
            var y = currentNoteArray[2];

            var name = currentNoteArray[3];
            var hold = currentNoteArray[4];
            var key = 'inverted-' + name;
            var newNote = noteTimings.create(x, y, key).setScale(0.35).refreshBody();
            newNote.setData('time', time);
            newNote.setData('x', x);
            newNote.setData('y', y);
            newNote.setData('name', name);
            newNote.setData('hold', hold);
            newNote.setData('animationRunning', false);
            newNote.disableBody(true, true);
        }

        noteTimings.children.iterate(function (child) {
            var time = child.getData('time');
            var x = Number(child.getData('x')) + 300;
            var y = child.getData('y');
            var name = child.getData('name');
            var key = name;
            var newNote = incomingNotes.create(x, y, key).setScale(0.40).refreshBody();
            newNote.setData('time', time);
            newNote.setData('x', x);
            newNote.setData('y', y);
            newNote.setData('name', name);
            newNote.setData('animationRunning', false);
            newNote.disableBody(true, true);

            var time = child.getData('time');
            var x = Number(child.getData('x'));
            var y = child.getData('y');
            var name = 'timerhand';
            var key = name;
            var newNote = timerHands.create(x, y, key).setScale(0.35).refreshBody();
            newNote.setOrigin(0.5, 1);
            newNote.setData('time', time);
            newNote.setData('x', x);
            newNote.setData('y', y);
            newNote.setData('name', name);
            newNote.setData('animationRunning', false);
            newNote.disableBody(true, true);
        });

    }, 500);
}

function editor ()
{
    //It was not edit mode
    if (editMode == false) {
        game.sound.stopAll();
        list.style.visibility = 'hidden';
        bgd.style.visibility = 'hidden';
        fgd.style.visibility = 'hidden';
        editParagraph.style.visibility = 'visible';
        editText.style.visibility = 'visible';
        submitContainer.visible = true;
        thumbImg.style.visibility = 'hidden';
    }
    //It was edit mode
    if (editMode == true) {
        exportBeatMap();
        progressBar.style.visibility = 'hidden';
        list.style.visibility = 'visible';
        bgd.style.visibility = 'visible';
        fgd.style.visibility = 'visible';
        editParagraph.style.visibility = 'hidden';
        editText.style.visibility = 'hidden';
        submitContainer.visible = false;
        saveContainer.visible = false;
        goHome();
    }
}

function loadEditVideo () {
    editMode = !editMode;
    videoID = editText.value;
    var thumbnailLink = "http://img.youtube.com/vi/" + videoID + "/0.jpg";
    thumbnailImg = document.getElementById('thumbnailImg');
    thumbnailImg.style.visibility = 'hidden';
    thumbnailImg.src = thumbnailLink;
    player.loadVideoById(videoID);
    selector.style.visibility = 'hidden';
    editParagraph.style.visibility = 'hidden';
    editText.style.visibility = 'hidden';
    submitContainer.visible = false;
    scoreText.visible = false;
    progressBar.style.visibility = 'visible';
    saveContainer.visible = true;

}

function exportBeatMap() {
    var allLines = videoID + '\n';
    allLines += player.getVideoData().title + '\n';
    editorNotes.children.iterate(function (child) {

        child.disableBody(true, true);

        var line = '';
        var x = child.getData('x');
        var y = child.getData('y');
        var name = child.getData('name');
        var time = child.getData('time');
        line += (time + ',' + x + ',' + y + ',' + name + ',' + '0' + ',' + '0' + '\n'); 
        allLines += line;
    });

    var data = new FormData();
    data.append("data" , allLines);
    var xhr = new XMLHttpRequest();
    xhr.open( 'post', 'beatmap.php', true );
    xhr.send(data);
}



function noteKeyIsPressed() {
    if (
        Phaser.Input.Keyboard.JustDown(w) || Phaser.Input.Keyboard.JustDown(cursors.up)) {
        currentKey = 'triangle';
        return true;
    }
    if (
        Phaser.Input.Keyboard.JustDown(a) || Phaser.Input.Keyboard.JustDown(cursors.left)) {
        currentKey = 'square';
        return true;
    }
    if (
        Phaser.Input.Keyboard.JustDown(s) || Phaser.Input.Keyboard.JustDown(cursors.down)) {
        currentKey = 'cross';
        return true;
    }
    if (
        Phaser.Input.Keyboard.JustDown(d) || Phaser.Input.Keyboard.JustDown(cursors.right)) {
        currentKey = 'circle';
        return true;
    }
    else {
        currentKey = '';
        return false;
    }
}

function noteKeyIsReleased() {
    if (
        Phaser.Input.Keyboard.JustUp(w) || Phaser.Input.Keyboard.JustUp(cursors.up)) {
        currentKey = 'triangle';
        return true;
    }
    if (
        Phaser.Input.Keyboard.JustUp(a) || Phaser.Input.Keyboard.JustUp(cursors.left)) {
        currentKey = 'square';
        return true;
    }
    if (
        Phaser.Input.Keyboard.JustUp(s) || Phaser.Input.Keyboard.JustUp(cursors.down)) {
        currentKey = 'cross';
        return true;
    }
    if (
        Phaser.Input.Keyboard.JustUp(d) || Phaser.Input.Keyboard.JustUp(cursors.right)) {
        currentKey = 'circle';
        return true;
    }
    else {
        currentKey = '';
        return false;
    }
}

var x = 32;
var y = 550;
var xOffset = 0;

function update ()
{
    //console.log(currentTime);
    progressBar.value = currentTime;

    if (countdown == 0) {
        countdownText.setText('');
        clearInterval(interval);
    }

    if (
        Phaser.Input.Keyboard.JustDown(p)) {
        pauseGame(this);
    }

    if (gameOver)
    {
        return;
    }

    /*if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }*/
    if (editMode) {
        if (noteKeyIsPressed()) {
            if (y < 100) {
                y = 550;
                xOffset = xOffset + 96;
                x = 32 + xOffset;
            }
            if (x == 32 + xOffset) {
                x = 64 + xOffset;
            }
            else if (x == 64 + xOffset) {
                x = 32 + xOffset;
            }
            y = y - 32;

            var newNote = editorNotes.create(x, y, currentKey).setScale(0.40).refreshBody();
            newNote.setData('x', x);
            newNote.setData('y', y);
            newNote.setData('name', currentKey);
            newNote.setData('time', currentTime);
        }
    }
    else {
        //If playing
        if (player.getPlayerState() == 1) {
            displayIncomingNotes(this);

            if (noteKeyIsReleased()) {
                holding = false;
            }

            if (holding == true) {
                score += 500;
                scoreText.setText('Score: ' + score);
            }

            if (noteKeyIsPressed()) {
                //Play sound effect either way
                this.sound.play('button1');
                var timingChild = noteTimings.getFirst(true);
                var incomingChild = incomingNotes.getFirst(true);
                var timerChild = timerHands.getFirst(true);
                var firstX = Phaser.Display.Bounds.GetCenterX(timingChild);
                var firstY = Phaser.Display.Bounds.GetCenterY(timingChild);
                var secondX = Phaser.Display.Bounds.GetCenterX(incomingChild);
                var secondY = Phaser.Display.Bounds.GetCenterY(timingChild);
                //If timing is close enough to a note to matter

                //NOTE:

                //Currently, only hitting the correct button matters, not the exact timing
                var distance = Phaser.Math.Distance.Between(firstX, firstY ,secondX, secondY);

                //Cool range
                if (distance < 8) {
                    if (currentKey == timingChild.getData('name')) {
                        //Display feedback     
                        newsprite = new feedbackSprite(this, firstX + 50, firstY - 50, randomCool()).setScale(0.25);
                        newsprite.animate(this);
                        score += 550;
                        scoreText.setText('Score: ' + score);
                        var hold = timingChild.getData('hold');
                        if (hold == 1) {
                            holding = true;
                        }
                    }
                    else {
                        //Display feedback            
                        newsprite = new feedbackSprite(this, firstX + 50, firstY - 50, 'wrong01').setScale(0.25);
                        newsprite.animate(this);
                        score += 275;
                        scoreText.setText('Score: ' + score);
                    }
                    //Remove note
                    noteTimings.remove(timingChild,true,true);
                    incomingNotes.remove(incomingChild,true,true);
                    timerHands.remove(timerChild,true,true);
                }
                //Fine range
                else if (distance < 16) {
                    if (currentKey == timingChild.getData('name')) {
                        //Display feedback            
                        newsprite = new feedbackSprite(this, firstX + 50, firstY - 50, randomFine()).setScale(0.25);
                        newsprite.animate(this);
                        score += 330;
                        scoreText.setText('Score: ' + score);
                        var hold = timingChild.getData('hold');
                        if (hold == 1) {
                            holding = true;
                        }
                    }
                    else {
                        //Display feedback            
                        newsprite = new feedbackSprite(this, firstX + 50, firstY - 50, 'wrong02').setScale(0.25);
                        newsprite.animate(this);
                        score += 165;
                        scoreText.setText('Score: ' + score);
                    }
                    //Remove note
                    noteTimings.remove(timingChild,true,true);
                    incomingNotes.remove(incomingChild,true,true);
                    timerHands.remove(timerChild,true,true);
                }
                //Safe range
                else if (distance < 24) {
                    if (currentKey == timingChild.getData('name')) {
                        //Display feedback            
                        newsprite = new feedbackSprite(this, firstX + 50, firstY - 50, 'safe').setScale(0.25);
                        newsprite.animate(this);
                        score += 110;
                        scoreText.setText('Score: ' + score);
                    }
                    else {
                        //Display feedback            
                        newsprite = new feedbackSprite(this, firstX + 50, firstY - 50, 'wrong03').setScale(0.25);
                        newsprite.animate(this);
                        score += 55;
                        scoreText.setText('Score: ' + score);
                    }
                    //Remove note
                    noteTimings.remove(timingChild,true,true);
                    incomingNotes.remove(incomingChild,true,true);
                    timerHands.remove(timerChild,true,true);
                }
                //Sad range
                else if (distance < 32) {
                    if (currentKey == timingChild.getData('name')) {
                        //Display feedback            
                        newsprite = new feedbackSprite(this, firstX + 50, firstY - 50, 'sad').setScale(0.25);
                        newsprite.animate(this);
                        score += 55;
                        scoreText.setText('Score: ' + score);
                    }
                    else {
                        //Display feedback            
                        newsprite = new feedbackSprite(this, firstX + 50, firstY - 50, 'wrong04').setScale(0.25);
                        newsprite.animate(this);
                        score += 33;
                        scoreText.setText('Score: ' + score);
                    }
                    //Remove note
                    noteTimings.remove(timingChild,true,true);
                    incomingNotes.remove(incomingChild,true,true);
                    timerHands.remove(timerChild,true,true);
                }
                //Worst range
                else if (distance < 40) {
                    if (currentKey == timingChild.getData('name')) {
                        //Display feedback            
                        newsprite = new feedbackSprite(this, firstX + 50, firstY - 50, 'worst').setScale(0.25);
                        newsprite.animate(this);
                        score += 0;
                        scoreText.setText('Score: ' + score);
                    }
                    else {
                        //Display feedback            
                        newsprite = new feedbackSprite(this, firstX + 50, firstY - 50, 'worst').setScale(0.25);
                        newsprite.animate(this);
                        score += 0;
                        scoreText.setText('Score: ' + score);
                    }
                    //Remove note
                    noteTimings.remove(timingChild,true,true);
                    incomingNotes.remove(incomingChild,true,true);
                    timerHands.remove(timerChild,true,true);
                    }
            }
        }
    }
}

function randomCool() {
    var rand = Math.floor((Math.random() * 3) + 1);
    if (rand == 1) {
        return 'cool01';
    }
    else if (rand == 2) {
        return 'cool02';
    }
    else {
        return 'cool03';
    }
}

function randomFine() {
    var rand = Math.floor((Math.random() * 2) + 1);
    if (rand == 1) {
        return 'fine01';
    }
    else {
        return 'fine02';
    }
}

function displayIncomingNotes(scene) {
    noteTimings.children.iterate(function (child) {
        var animationRunning = child.getData('animationRunning');
        if (animationRunning == false) {
            if (currentTime > 0 && Number(child.getData('time')) < (Number(currentTime) + duration)) {
                child.enableBody(true, child.x, child.y, true, true);
                var timeOffset = 0;
                if (child.getData('time') < duration) {
                    timeOffset = duration - Number(child.getData('time'));
                    timeOffset *= 1000;
                }

                //Adjust timeout to let note fly off screen
                if (timeOffset != 0) {
                    var timer = new Timer(function() {
                        noteTimings.remove(child,true,true);
                    }, duration*1000 - timeOffset);
                    timeouts.push(timer);
                }
                else {
                    var timer = new Timer(function() {
                        noteTimings.remove(child,true,true);
                    }, duration*1000);
                    timeouts.push(timer);
                }
                //console.log(child.getData('time') + 'started running at' + currentTime);
                child.setData('animationRunning', true);

                var hold = child.getData('hold');
                if (hold == 1) {
                    var firstX = Phaser.Display.Bounds.GetCenterX(child);
                    var firstY = Phaser.Display.Bounds.GetCenterY(child);
                    var holdsprite = new holdSprite(scene, firstX, firstY + 25, 'hold').setScale(0.4);
                    holdsprite.remove();
                }
            }
        }
    });

    incomingNotes.children.iterate(function (child) {
        var animationRunning = child.getData('animationRunning');
        if (animationRunning == false) {
            //If note is coming in 5 seconds or less
            //Ex: note that starts at 5sec will show from 0sec
            if ( currentTime > 0 && Number(child.getData('time')) < (Number(currentTime) + duration)) {
                child.enableBody(true, child.x, child.y, true, true);
                var timeOffset = 0;
                if (child.getData('time') < duration) {
                    timeOffset = duration - Number(child.getData('time'));
                    timeOffset *= 1000;
                }
                var tween = scene.tweens.add({
                    targets: child,
                    x: (child.x - 300),
                    ease: 'Linear',
                    //Duration matches the currentTime + 5, in the if statement above
                    duration: duration*1000 - 50 - timeOffset,
                    yoyo: false,
                    repeat: 0
                });
                //Adjust timeout to let note fly off screen
                if (timeOffset != 0) {
                    var timer = new Timer(function() {
                        incomingNotes.remove(child,true,true);
                    }, duration*1000 - timeOffset);
                    timeouts.push(timer);
                }
                else {
                    var timer = new Timer(function() {
                        incomingNotes.remove(child,true,true);
                    }, duration*1000);
                    timeouts.push(timer);
                }
                child.setData('animationRunning', true);
            }
        }
    });

    timerHands.children.iterate(function (child) {
        var animationRunning = child.getData('animationRunning');
        if (animationRunning == false) {
            //If note is coming in 5 seconds or less
            //Ex: note that starts at 5sec will show from 0sec
            if ( currentTime > 0 && Number(child.getData('time')) < (Number(currentTime) + duration)) {
                child.enableBody(true, child.x, child.y, true, true);
                var timeOffset = 0;
                if (child.getData('time') < duration) {
                    timeOffset = duration - Number(child.getData('time'));
                    timeOffset *= 1000;
                }
                var tween = scene.tweens.add({
                    targets: child,
                    angle: 360,
                    ease: 'Linear',
                    //Duration matches the currentTime + 5, in the if statement above
                    duration: duration*1000 - 50 - timeOffset,
                    yoyo: false,
                    repeat: 0
                });
                //Adjust timeout to let note fly off screen
                if (timeOffset != 0) {
                    var timer = new Timer(function() {
                        timerHands.remove(child,true,true);
                    }, duration*1000 - timeOffset);
                    timeouts.push(timer);
                }
                else {
                    var timer = new Timer(function() {
                        timerHands.remove(child,true,true);
                    }, duration*1000);
                    timeouts.push(timer);
                }
                child.setData('animationRunning', true);
            }
        }
    });
}

function pauseGame(scene) {
    //Pausing game
    if (paused == false) {
        for (var i = 0; i < timeouts.length; i++) {
            timeouts[i].pause();
        }
        scene.tweens.pauseAll();
        player.pauseVideo();
        thumbnailImg.style.visibility = 'visible';
        pauseContainer.visible = true;
    }
    //Unpausing game
    else {
        pauseContainer.visible = false;
        thumbnailImg.style.visibility = 'hidden';
        //3 second countdown until resuming
        setTimeout(function() {        
            player.playVideo();
            scene.tweens.resumeAll();
            for (var i = 0; i < timeouts.length; i++) {
                timeouts[i].resume();
            }
        }, 3000);
        countdown = 3;
        countdownText = scene.add.text(400, 0, countdown, { fontSize: '32px', fill: '#FFFFFF' });
        interval = setInterval(function() {
            countdown -= 1;
            countdownText.setText(countdown);
        }, 1000);
    }
    paused = !paused;
}

class feedbackSprite extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
    }
    animate(scene) {
        scene.tweens.add({
          targets: [this],
          ease: 'Sine.easeInOut',
          duration: 1000,
          delay: 0,
          alpha: {
            getStart: () => 1.0,
            getEnd: () => 0.0
          },
          onComplete: () => {
            //handle completion
          }
        });
    }
}

class holdSprite extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
    }
    remove(scene) {
        setTimeout( () => this.destroy(), duration*1000);
    }
}

function begin() {
        progressBar.max = player.getDuration();
}



var player;

function onYouTubePlayerAPIReady() {
    player = new YT.Player('player', {
        width: 800,
        height: 600,
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'autohide': 1,
            'wmode': 'opaque',
            'showinfo': 0,
            'loop': 1,
            'mute': 0,
            'disablekb': 1,
            'modestbranding': 1,
            'iv_load_policy': 3
            //'start': 15,
            //'end': 110,
            //'playlist': 'NQKC24th90U'
        },
        videoId: videoID,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}


function onPlayerReady(event) {
    event.target.mute();
    event.target.setVolume(50);
    startInterval();
}

var firstTime = true;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        event.target.unMute();
        begin();
    }
}

function startInterval() {
    checkInt = setInterval(function() {
        currentTime = player.getCurrentTime();
    }, 5);
}

function Timer(callback, delay) {
    var timerId, start, remaining = delay;

    this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
    };

    this.resume = function() {
        start = new Date();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining);
    };

    this.resume();
}