import {requireElementById} from 'app/utils/dom';

const playPauseButton = requireElementById('pausePlay');
export function pauseGame(state: GameState, ping: boolean, message: string) {
    state.gameIsStopped = !state.gameIsStopped;
    /*if (needsDataSnapshots()) {
        Data.discardToSnapshot("base", 1);
        Data.recordSnapshot("pause");
    }*/
    //view.requestUpdate("updateTime", null);
    //view.requestUpdate("updateCurrentActionBar", actions.currentPos);
    //view.update();
    if (!state.gameIsStopped && state.options.notifyOnPause) {
        clearPauseNotification();
    }
    document.title = state.gameIsStopped ? "*PAUSED* Idle Loops" : "Idle Loops";
    playPauseButton.textContent = state.gameIsStopped ? "Play" : "Pause";
    if (!state.gameIsStopped && (state.shouldRestart /*|| timer >= timeNeeded*/)) {
        restart(state);
    } else if (ping) {
        if (state.options.pingOnPause) {
            beep(250);
            setTimeout(() => beep(250), 500);
        }
        if (state.options.notifyOnPause) {
            showPauseNotification(message || "Game paused!");
        }
    }
}

export function addMana(state: GameState, amount: number) {
    state.loopState.mana += amount;
}


// modified from: https://stackoverflow.com/questions/879152/how-do-i-make-javascript-beep/13194087#13194087
function beep(duration: number) {
    // @ts-ignore
    const ctxClass = window.audioContext || window.AudioContext || window.AudioContext || window.webkitAudioContext;
    const ctx = new ctxClass();
    const osc = ctx.createOscillator();

    // stop/start for new browsers, on/off for old
    osc.connect(ctx.destination);
    if (osc.noteOn) osc.noteOn(0);
    if (osc.start) osc.start();

    setTimeout(() => {
        if (osc.noteOff) osc.noteOff(0);
        if (osc.stop) osc.stop();
    }, duration);
}

function restart(state: GameState) {
    state.shouldRestart = false;
    /*timer = 0;
    timeCounter = 0;
    effectiveTime = 0;
    timeNeeded = timeNeededInitial;
    document.title = "Idle Loops";
    currentLoop = totals.loops + 1; // don't let currentLoop get out of sync with totals.loops, that'd cause problems
    resetResources();
    restartStats();
    for (let i = 0; i < towns.length; i++) {
        towns[i].restart();
    }
    view.requestUpdate("updateSkills");
    actions.restart();
    view.requestUpdate("updateCurrentActionsDivs");
    view.requestUpdate("updateTrials", null);
    if (needsDataSnapshots()) {
        Data.updateSnapshot("restart", "base");
    }*/
}

let pauseNotification: Notification|undefined;
function showPauseNotification(message: string) {
    // pauseNotification = new Notification("Idle Loops", { icon: "favicon-32x32.png", body: message, tag: "paused", renotify: true });
}

function clearPauseNotification() {
    if (pauseNotification) {
        pauseNotification.close();
        pauseNotification = undefined;
    }
}

export function unlockZone(state: GameState, index: ZoneIndex) {
    state.discoveredZones.add(index);
    state.loopState.zoneIndex = index;
}
