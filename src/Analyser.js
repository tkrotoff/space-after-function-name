import TabsOrSpaces from './TabsOrSpaces';

var noSpaceLines = 0;
var oneSpaceLines = 0;
var reposWithProperFiles = 0;
var reposWithResults = 0;
var noSpaceRepos = 0;
var oneSpaceRepos = 0;
var unknownStyleRepos = 0;

export default class Analyser {

    constructor(language, db, githubToken) {
        this.language = language;
        this.db = db;
        this.githubToken = githubToken;
    }

    startAnalysing() {
        console.log('Contacting Database');

        this.db.readAnd((snapshot) => this.beginAnalyseWith(snapshot));
    }

    beginAnalyseWith(snapshot) {
        console.log('Got results from Firebase');
        console.log(snapshot);

        this.snapshot = snapshot || {};
        this.analyseRepos = this.analyseHowManyRepos();

        if (!this.analyseRepos) {
            console.log('Over 500 repos analysed, aborting mission');
            process.exit();
        }

        TabsOrSpaces(this.options()).analyse().then((results) => this.collectAndSave(results)).catch(this.handleShitStorm);
    }

    analyseHowManyRepos() {
        if (this.snapshot.analysedRepos >= 500)
            return false;

        if (this.snapshot.analysedRepos > 470)
            return 500 - this.snapshot.analysedRepos;

        return 30;
    }

    options() {
        return {
            githubToken: this.githubToken,
            language: this.language,
            perPage: this.analyseRepos,
            page: this.snapshot.analysedRepos ? this.snapshot.analysedRepos / 30 + 1 : 1
        };
    }

    collectAndSave(results) {
        console.log('=> Got these results:');
        console.log(results);

        var analysedRepos = this.snapshot.analysedRepos ? this.snapshot.analysedRepos + this.analyseRepos : 30;

        for (var i = 0; i < results.length; i ++) {
            var repo = results[i];
            noSpaceLines += repo.noSpaceAfterFunctionNameCount;
            oneSpaceLines += repo.oneSpaceAfterFunctionNameCount;

            reposWithProperFiles++;
            switch (repo.type) {
                case 'noSpace':
                    noSpaceRepos++;
                    break;
                case 'oneSpace':
                    oneSpaceRepos++;
                    break;
                case 'unknown':
                    unknownStyleRepos++;
                    break;
                default:
                    throw new Error('Unknown type:', repo.type);
            }
        }
        console.log('Saving info to Database');

        this.db.write({
            analysedRepos: analysedRepos,
            noSpaceAfterFunctionNameLines: noSpaceLines,
            oneSpaceAfterFunctionNameLines: oneSpaceLines,
            reposWithProperFiles: reposWithProperFiles,
            reposWithResults: noSpaceRepos + oneSpaceRepos,
            noSpaceAfterFunctionNameRepos: noSpaceRepos,
            oneSpaceAfterFunctionNameRepos: oneSpaceRepos,
            unknownStyleRepos: unknownStyleRepos
        });
    }

    handleShitStorm(error) {
        console.log(error);
        process.exit(1);
    }
}
