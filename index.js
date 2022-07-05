const OBSWebSocket = require('obs-websocket-js');
const express = require('express');
const cors = require('cors');
const config = require('./config.json')
const app = express();
const port = 3333;
const address = 'localhost:4444';
const password = 'password';
const obs = new OBSWebSocket();

app.use(cors({
  origin: 'https://nowfinity.zerody.one',
  optionSuccessStatus: 200,
}))

obs.connect({ address, password }).then(() => {
  app.post('/replay', async (req, res) => {
    res.status(204).send('');
    const { name } = await obs.send('GetCurrentScene')
    if (config.blacklist.includes(name)) return;
    const previousScene = name;
    await obs.send('TriggerHotkeyByName', { "hotkeyName": "instant_replay.trigger" })

    setTimeout(async () => {
      await obs.send('SetCurrentScene', { "scene-name": config.replayScene })
      setTimeout(async () => {
        const { name } = await obs.send('GetCurrentScene')
        // Let's only go back to the previous scene if we haven't left the replay scene
        if (name === config.replayScene) {
          await obs.send('SetCurrentScene', { "scene-name": previousScene });
        }
      }, 29800)
    }, 2000);
  });

  app.listen(port, () => {
    console.log(`Listening on port http://127.0.0.1:${port}`)
  })
}).catch(err => console.error(err));

obs.on('error', err => console.log(err))
