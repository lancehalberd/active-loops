import {getState} from 'app/state';
import {requireElementById} from 'app/utils/dom';
import {initializeCharacterStats} from 'app/views/characterStats';
import {initializeTravelMenu} from 'app/views/travelMenu';

window.closeTutorial = () => requireElementById("tutorial").style.display = "none";
window.closeTutorial();

const state = getState();
initializeTravelMenu(state);
initializeCharacterStats(state);
