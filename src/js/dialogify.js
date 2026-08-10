/**
 * dialogify
 * https://github.com/OneupNetwork/dialogify
 */

import Dialogify from './core.js';
import { defineDialogifyElement, ELEMENT_NAME } from './element.js';

// Register <dialog is="bahamut-dialogify">. Safely no-ops in environments
// without customized built-in element support.
defineDialogifyElement();

Dialogify.ELEMENT_NAME = ELEMENT_NAME;
Dialogify.defineElement = defineDialogifyElement;

if (typeof window !== 'undefined') {
    window.Dialogify = Dialogify;
}

export default Dialogify;
