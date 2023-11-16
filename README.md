# openai-nightwatch-service

A simple HTTP API service which uses the OpenAI API to analyse automated test failures. Part of the [Using the OpenAI platform to analyse automated test failures](https://labs.pineview.io/using-openai-platform-to-analyse-automated-test-failures/) tutorial.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/pineviewlabs/openai-nightwatch-service.git
cd openai-nightwatch-service
npm install
```

## Configuration

The service requires an OpenAI API key to be configured. You can obtain an API key from the [OpenAI API](https://platform.openai.com/).

The API key can be configured using the `OPENAI_API_KEY` environment variable. You can also use `.env` files. 

```bash
OPENAI_API_KEY=your-api-key
```

## Running the service

The service can be started using the `npm start` command:

```bash
npm start
```

The service will be available at `http://localhost:4001`.

## API

The service exposes a single endpoint at `/analyze-error` which accepts a POST request with a JSON body containing the error message to analyse. 

See also the [nightwatch-openai-plugin](

## License
MIT