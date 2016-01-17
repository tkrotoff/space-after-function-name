import https from 'https';
import _ from 'underscore';
import Promise from 'promise';
import detectSpaceAfterFunctionName from './detectSpaceAfterFunctionName.js';

export default function TabsOrSpaces(args) {

    var token = args.githubToken;
    var language = args.language;
    var page = args.page || 1;
    var perPage = args.perPage || 20;

    var reposLength;
    var reposStats = {};
    var results = [];

    var success, fail;

    function analyseLanguage() {
        return new Promise(function (resolve, reject) {
            success = resolve;
            fail = reject;

            https.request(
                getOptions('api.github.com', '/search/repositories?q=+language:' + language + '&sort=stars&order=desc' + '&page=' + page + '&per_page=' + perPage),
                constructResponseAnd(analyseRepos)
            ).end();
        });
    }

    function analyseRepos(response) {
        var repos = JSON.parse(response).items;

        if (!repos)
            return fail(new Error('No repos returned from GitHub'));

        reposLength = repos.length;

        for (var i = 0; i < repos.length; i++)
            analyseRepo(repos[i].full_name);
    }

    function analyseRepo(repoName) {
        reposStats[repoName] = { noSpaceAfterFunctionNameCount: 0, oneSpaceAfterFunctionNameCount: 0};

        https.request(
            getOptions('api.github.com', '/search/code?q=repo:' + repoName + '+language:' + language),
            constructResponseAnd(analyseFiles, repoName)
        ).end();
    }

    function analyseFiles(repo, response) {
        var files = JSON.parse(response).items;

        // Ignores files ending with .min.js and -min.js
        files = _.filter(files, file => !file.path.endsWith('.min.js') && !file.path.endsWith('-min.js'));

        if (!files || files.length === 0) {
            reposLength -= 1;
            return;
        }

        reposStats[repo].files = files.length;

        for (var i = 0; i < files.length; i ++)
            analyseFile(files[i], repo);
    }

    function analyseFile(file, repo) {
        var repoName = file.repository.full_name;
        var options = getOptions('raw.githubusercontent.com', '/' + repoName + '/master/' + encodeURIComponent(file.path));

        https.request(options, constructResponseAnd(detectFileSpaceAfterFunctionName, {repoName: repoName, file: file.path})).end();
    }

    function detectFileSpaceAfterFunctionName(params, response) {
        console.log('repo:', params.repoName, 'file:', params.file);
        saveStatistics(params.repoName, detectSpaceAfterFunctionName(response));
    }

    function saveStatistics(repo, spaceAfterFunctionName) {
        console.log('noSpaceAfterFunctionNameCount =', spaceAfterFunctionName.noSpaceAfterFunctionNameCount);
        console.log('oneSpaceAfterFunctionNameCount =', spaceAfterFunctionName.oneSpaceAfterFunctionNameCount);

        reposStats[repo].noSpaceAfterFunctionNameCount += spaceAfterFunctionName.noSpaceAfterFunctionNameCount;
        reposStats[repo].oneSpaceAfterFunctionNameCount += spaceAfterFunctionName.oneSpaceAfterFunctionNameCount;
        reposStats[repo].files--;

        if (reposStats[repo].files === 0)
            pushRepoStatistics(repo);

        if (results.length === reposLength)
            return success(results);
    }

    function pushRepoStatistics(repo) {
        var noSpace = reposStats[repo].noSpaceAfterFunctionNameCount;
        var oneSpace = reposStats[repo].oneSpaceAfterFunctionNameCount;

        var type;
        if (noSpace > oneSpace) {
            type = 'noSpace';
        } else if (noSpace == oneSpace) {
            type = 'unknown';
        } else {
            type = 'oneSpace';
        }

        results.push({
            repo: repo,
            type: type,
            noSpaceAfterFunctionNameCount: noSpace,
            oneSpaceAfterFunctionNameCount: oneSpace
        });

        console.log('Repos done with ' + results.length + ' of ' + reposLength);
    }

    function getOptions(host, path, page) {
        var options = {
            host: host,
            path: path,
            page: page || 1,
            headers: {
                'user-agent': 'NodeJS HTTP Client',
            }
        };
        if (token)
            options.headers.Authorization =  'token ' + token;

        return options;
    }

    function constructResponseAnd(callback, extraParams) {
        return function (response) {
            var str = '';

            response.on('data', function (chunk) {
                str += chunk;
            });
            response.on('end', function () {
                if (extraParams) {
                    return callback(extraParams, str);
                }
                callback(str);
            });
        }
    }

    return { analyse: analyseLanguage };
}
