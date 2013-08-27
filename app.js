var http   = require('http'),
    fs     = require('fs'),
    path   = require('path'),
    config = require('config'),
    exec   = require('child_process').exec;

http.createServer(function (req, res) {
    var localRepos = config.localRepos || {};

    // 対象になっているレポジトリ名を取得
    var repName = req.url.substr(1);
    if (!repName) {
        console.log('no remoto repo.');
        return notFound(res);
    }

    // ローカルレポジトリの場所
    var repoPath = localRepos[repName];
    if (!repoPath) {
        console.log('no matching local repo.');
        return notFound(res);
    }

    // repoPathの存在確認
    if (!fs.existsSync(repoPath)) {
        console.log('local repo does not exist.');
        return notFound(res);
    };


    // レポジトリを更新するスクリプトを作成
    // (実在する、gitRoot直下のpathを埋め込むだけなので、たぶんせきゅあ…)
    var sh = [
        'cd ' + repoPath,
        'git fetch',
        'git reset --soft refs/remotes/origin/master'
    ].join(' && ');

    // 実行
    exec(sh, function (error, stdout, stderr) {
        if (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.write(JSON.stringify({
                error: error,
                stderr: stderr
            }));
            res.end();
            return;
        }

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({
            success: 1
        }));

        res.end();
    });
}).listen(config.port || 3000, '127.0.0.1');

var notFound = function (res) {
    res.writeHead(404, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({
        error: 'not found.'
    }));

    res.end();
};


console.log('Server running at http://127.0.0.1:%d/', config.port);