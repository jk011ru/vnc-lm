# vnc-lm

### Introduction
[**vnc-lm**](https://github.com/jake83741/vnc-lm) is a Discord bot that lets you talk with and configure language models in your server. It uses [**ollama**](https://github.com/ollama/ollama) to manage and run different models.

[![image](https://github.com/user-attachments/assets/f31e4c58-4338-4af5-9269-828fcfb3bd5c) 
](https://github.com/jake83741/vnc-lm/blob/main/imgs/363810259-f31e4c58-4338-4af5-9269-828fcfb3bd5c.png?raw=true) 
<br> <sup>Web scraping example</sup>
<br>
![image](https://github.com/user-attachments/assets/35b942c4-157d-49b4-a060-5270c1d295c7)
<br> <sup>Model pulling example</sup>

### Features
#### Model Management
Change models using the `/model` command and adjust parameters like `num_ctx`, `system_prompt`, and `temperature`. Notifications are sent when models load into RAM. The bot responds wherever `/model` was last used. Models can be removed with the `remove` parameter. Download models directly through Discord by messaging a tag URL.
> `https://ollama.com/library/phi3.5:3.8b-mini-instruct-q2_K`

Model downloading and removal is turned off by default and can be enabled by configuring the `.env`. 
 
#### QoL Improvements
Streaming message generation with messages longer than 1500 characters split into pages. Message attachments like text-based files, web links, and screenshots can be added into the context window. The bot can be configured to reply with or without mentioning it through the `.env`.

Switch between conversations by clicking `rejoin conversation` in the Discord context menu. Conversations can be continued from any point and with different models. All messages are cached and organized into conversations. `Entrypoint.sh` helps the cache file persist across Docker containers. 

Messaging `stop` will end message generation early. Messaging `reset` returns models to their default configuration.

### Requirements 
1. [**Ollama**](https://github.com/ollama/ollama): Get up and running with Llama 3.1, Mistral, Gemma 2, and other large language models.
2. [**Docker**](https://www.docker.com/): Docker is a platform designed to help developers build, share, and run container applications. We handle the tedious setup, so you can focus on the code.

### Environment Configuration
1. Clone the repository with
   `git clone https://github.com/jake83741/vnc-lm.git`
2. CD into the directory with
   `cd vnc-lm`
3. Rename `.env.example` to `.env` in the project root directory. Configure the `.env` file:
   <br> <br>
- `TOKEN=`: Your Discord bot token. Use the [**Discord Developer Portal**](https://discord.com/developers/applications/) to create this. Check the necessary permissions for your Discord bot.
- `OLLAMAURL=`: The URL of your Ollama server. See [**API documentation**](https://github.com/ollama/ollama/blob/main/docs/api.md#request). Docker requires `http://host.docker.internal:11434`
- `NUM_CTX=` Value controlling context window size. Defaults to 2048.
- `TEMPERATURE=` Value controlling the randomness of responses. Defaults to 0.4.
- `KEEP_ALIVE=`: Value controlling how long a model stays in memory. Defaults to 45m.
- `CHARACTER_LIMIT=` Value controlling the character limit for page embeds. Defaults to 1500.
- `API_RESPONSE_UPDATE_FREQUENCY=` Value controlling amount of API responses to chunk before updating message. A low number will cause Discord API to throttle. Defaults to 10.
- `ADMIN=` Discord user ID. This will enable downloading and removing models.
- `REQUIRE_MENTION=` Require the bot to be mentioned or not. Defaults to false.

### Docker Installation (Preferred)
```
docker compose up --build
```

### Manual Installation
<details>
<br>

 ```
npm install
npm run build
npm start
 ```
</details>

### Usage
1. `/model`: Load, configure, or remove a language model. Optional parameters for `num_ctx`, `system_prompt`, `temperature`, and `remove`.

[<img width="977" alt="image" src="https://github.com/user-attachments/assets/38e254cc-b6b5-4de1-b3a9-59176e133e09">
](https://github.com/jake83741/vnc-lm/blob/main/imgs/366593695-38e254cc-b6b5-4de1-b3a9-59176e133e09.png?raw=true)
<br> 
<sup>`/model` example</sup>

2. `Rejoin Conversation`: Rejoin an old conversation at a specific point. Messages up to the selected point in the conversation will also be included.

[![image](https://github.com/user-attachments/assets/7f629653-48ff-46f8-9ee9-ed306cceea55)
](https://github.com/jake83741/vnc-lm/blob/main/imgs/365389934-7f629653-48ff-46f8-9ee9-ed306cceea55.png?raw=true)
<br> 
<sup>`Rejoin Conversation` example</sup>

3.  `/help`: Instructions for how to use the bot.

[<img width="977" alt="image" src="https://github.com/user-attachments/assets/192ccccd-d33c-4bb4-ac8f-3c31d6c91dc6">
](https://github.com/jake83741/vnc-lm/blob/main/imgs/364975217-192ccccd-d33c-4bb4-ac8f-3c31d6c91dc6.png?raw=true)
<br> 
<sup>`/help` example</sup>

### Tree Diagram
```console
.
├── LICENSE
├── README.md
├── docker-compose.yaml
├── dockerfile
├── entrypoint.sh
├── .env.example
├── imgs
├── package.json
├── src
│   ├── api-connections
│   │   ├── api-requests.ts
│   │   ├── library-refresh.ts
│   │   ├── model-loader.ts
│   │   └── model-pull.ts
│   ├── bot.ts
│   ├── commands
│   │   ├── command-registry.ts
│   │   ├── help-command.ts
│   │   ├── model-command.ts
│   │   ├── optional-params
│   │   │   └── remove.ts
│   │   └── rejoin-conversation.ts
│   ├── functions
│   │   ├── ocr-function.ts
│   │   └── scraper-function.ts
│   ├── managers
│   │   ├── cache-manager.ts
│   │   ├── message-manager.ts
│   │   └── page-manager.ts
│   ├── message-generation
│   │   ├── chunk-generation.ts
│   │   ├── message-create.ts
│   │   └── message-preprocessing.ts
│   └── utils.ts
└── tsconfig.json
```

### Notes
1. If an issue arises with the Docker set-up, change the `Ollama_Host` environment variable to 0.0.0.0. See [**server documentation**](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server).
2. Attachments with large amounts of text will require a higher `num_ctx` value to work properly.

### Dependencies
<details>
<br>
 
1. [**Axios**](https://github.com/axios/axios): Promise based HTTP client for the browser and node.js.
2. [**Discord.js**](https://github.com/discordjs/discord.js): A powerful JavaScript library for interacting with the Discord API.
3. [**dotenv**](https://github.com/motdotla/dotenv): Loads environment variables from .env for nodejs projects.
4. [**tesseract.js**](https://github.com/naptha/tesseract.js): A javascript library that gets words in almost any language out of images.
5. [**jsdom**](https://github.com/jsdom/jsdom): A JavaScript implementation of various web standards, for use with Node.js
6. [**readbility**](https://github.com/mozilla/readability): A standalone version of the readability lib

</details>

### License
This project is licensed under the MIT License.
