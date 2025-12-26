import OpenAI from "openai";

const OPENAI_API_KEY = "";

// const client = new OpenAI({
//     apiKey : OPENAI_API_KEY
// })

// const response = await client.response.create({
//     model : "gpt-4.1",
//     input: "Write a story about code in AI world",
//     temperature : 0.7,
//     max_output_tokens: 250
// })

// console.log(response)

const client = new OpenAI({
    apiKey : OPENAI_API_KEY
})

const stream = await client.response.create({
    model : "gpt-4.1",
    input: "Write a story about code in AI world",
    temperature : 0.7,
    max_output_tokens: 250,
    stream : true
})

for(const event of stream){
    process.stdout.write(event.delta)
}


