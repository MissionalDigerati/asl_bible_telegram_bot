#ASL Bible Telegram Bot

This bot is used by the [Telegram Messenger App](http://telegram.me) to retrieve Bible passages in American Sign Language.  It uses the [Digital Bible Platform](http://digitalbibleplatform.org) to retrieve the passages.  Check it out at @ASLBible.

#Deploy

- First clone the repository
- change to the document root, and run `npm install`
- add your configurations `cp config.example.js config.js`
- Install Forever
```
sudo su
npm install -g forever
```
- Add a crontab to restart the app
```
@reboot /your/path/to/your/start-forever.sh
```
- Set up Apache to run the server
- Use `start-forever.sh` to start the service

#Development

This repository is following the branching technique described in [this blog post](http://nvie.com/posts/a-successful-git-branching-model/), and the semantic version set out on the [Semantic Versioning Website](http://semver.org/).

Questions or problems? Please post them on the [issue tracker](https://github.com/MissionalDigerati/asl_bible_telegram_bot/issues). You can contribute changes by forking the project and submitting a pull request.

Run with the environment variable `NODE_ENV=production node index.js`.

#License

This code is copyrighted by [Missional Digerati](http://missionaldigerati.org) and is under the [GNU General Public License v3](http://www.gnu.org/licenses/gpl-3.0-standalone.html).
