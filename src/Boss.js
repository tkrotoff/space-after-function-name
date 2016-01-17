import {File} from './Database';
import Analyser from './Analyser';

let language = 'javascript';
let db = new File('results.json'); // File path and name where to save the results
let githubToken = 'Your Personal Github TOKEN (only public_repo rights needed)';

setInterval(function () {
    new Analyser(language, db, githubToken).startAnalysing();
}, 120000);
