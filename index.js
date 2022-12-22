const tmi = require('tmi.js');
const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');

const openai = new OpenAIApi(new Configuration({ apiKey: "" }));

const client = new tmi.Client({
  options: { debug: true },
  connection: {
    secure: true,
    reconnect: true
  },
  identity: {
    username: 'Neocraftbot19',
    password: 'oauth:'
  },
  channels: ['neocraft1293']
});

client.connect();

// Lisez les messages à partir du fichier JSON
try {
  messages = JSON.parse(fs.readFileSync('messages.json'));
} catch (err) {
  console.error(err);
  messages = [];
}

client.on('chat', function(channel, user, message, self) {
  // Ajoutez le message au tableau de messages
  messages.push({ user: user['display-name'], message: message });

  // Écrivez le tableau de messages dans un fichier JSON
  fs.writeFileSync('messages.json', JSON.stringify(messages));
});

client.on('chat', async function(channel, user, message, self) {
  if (message.includes('@Neocraftbot19') || message.includes('bonjour') || message.includes('salut')) {
    const response = await sendMessageToBot(messages);
    if (typeof response === 'string') {
      const responsem = response.replace("Neocraftbot19: ", "");
      client.say(channel, responsem);
    } else {
      console.log("La réponse du bot n'est pas une chaîne de caractères.");
    }
  }
});


async function sendMessageToBot(messages) {
  // Concaténez tous les messages en une seule chaîne de caractères
  const message = messages.map(m => `${m.user}: ${m.message}`).join('\n');

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: message,
    temperature: 0.5,
    max_tokens: 60,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
    stop: ["."],
  });
  return response.data.choices[0].text;
}