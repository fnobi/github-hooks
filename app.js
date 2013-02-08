var http   = require('http'),
    fs     = require('fs'),
    path   = require('path'),
    config = require('config'),
    exec   = require('child_process').exec;

http.createServer(function (req, res) {
        // 対象になっているレポジトリ名を取得
        var repName = req.url.substr(1);

        if (!repName) {
                return notFound(res);
        }

        // bareレポジトリの場所
        var repPath = path.resolve(config.gitRoot, repName + '.git');

        // repPathにファイルがなければ、中止 (404を返す)
        if (!fs.existsSync(repPath)) {
                return notFound(res);
        };

        // bareレポジトリを更新するスクリプトを作成
        // (実在するpathを埋め込むだけなので、セキュリティはたぶん大丈夫…)
        var sh = [
                'cd ' + repPath,
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